import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";
import { nanoid } from "nanoid";
import OpenAI from "openai";

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware to require recruiter or admin role
const requireRecruiterOrAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.user && (req.user.role === "RECRUITER" || req.user.role === "ADMIN")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Requires Recruiter or Admin role" });
  }
};

// Get all interviews for user (as interviewer or candidate)
router.get("/", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { interviewerId: userId },
          { candidateId: userId },
        ],
      },
      include: {
        interviewer: { select: { name: true, email: true } },
        candidate: { select: { name: true, email: true } },
        questions: { select: { id: true, title: true } },
      },
    });
    res.json(interviews);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to fetch interviews", error: errorMessage });
    return;
  }
});

// Create interview (recruiter/admin only)
router.post("/", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const {
      title,
      company,
      description,
      interviewerId,
      candidateId,
      duration,
      startTime,
      questionIds,
    } = req.body;

    // Validate required fields
    if (!title || !company || !interviewerId || !duration || !startTime) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Validate that questions exist
    if (!questionIds || questionIds.length === 0) {
      res.status(400).json({ message: "At least one question is required" });
      return;
    }

    // Verify that all questions exist
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds
        }
      }
    });

    if (questions.length !== questionIds.length) {
      res.status(400).json({ message: "One or more questions not found" });
      return;
    }

    // Generate a unique join code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create the interview with questions
    const interview = await prisma.interview.create({
      data: {
        title,
        company,
        description,
        duration,
        startTime: new Date(startTime),
        interviewerId,
        candidateId,
        joinCode,
        questions: {
          connect: questionIds.map((id: string) => ({ id }))
        }
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            testCases: true,
          },
        },
      },
    });
    res.status(201).json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error creating interview:", err);
    res.status(500).json({ message: "Failed to create interview", error: errorMessage });
    return;
  }
});

// Get interview by id (must be interviewer or candidate)
router.get("/:id", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        interviewer: { select: { name: true, email: true } },
        candidate: { select: { name: true, email: true } },
        questions: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            testCases: true,
          },
        },
      },
    });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    res.json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to fetch interview", error: errorMessage });
    return;
  }
});

// Update interview (recruiter/admin only)
router.put("/:id", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const {
    title,
    company,
    description,
    interviewerId,
    candidateId,
    duration,
    startTime,
    status,
    questionIds,
  } = req.body;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        title,
        company,
        description,
        interviewerId,
        candidateId,
        duration,
        startTime: startTime ? new Date(startTime) : undefined,
        status,
        questions: questionIds ? { set: questionIds.map((qid: string) => ({ id: qid })) } : undefined,
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
        candidate: { select: { id: true, name: true, email: true } },
        questions: { select: { id: true, title: true } },
      },
    });
    res.json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error updating interview:", err);
    res.status(500).json({ message: "Failed to update interview", error: errorMessage });
    return;
  }
});

// Delete interview (recruiter/admin only)
router.delete("/:id", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    await prisma.interview.delete({ where: { id } });
    res.json({ message: "Interview deleted successfully" });
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error deleting interview:", err);
    res.status(500).json({ message: "Failed to delete interview", error: errorMessage });
    return;
  }
});

// Start interview
router.post("/:id/start", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "IN_PROGRESS", startTime: new Date() }
    });
    res.json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to start interview", error: errorMessage });
    return;
  }
});

// End interview
router.post("/:id/end", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "COMPLETED", endTime: new Date() }
    });
    res.json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to end interview", error: errorMessage });
    return;
  }
});

// Join interview by code (candidate only)
router.get("/join/:joinCode", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { joinCode } = req.params;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.findUnique({ where: { joinCode } });
    if (!interview) { res.status(404).json({ message: "Invalid join code" }); return; }
    if (interview.candidateId !== userId) {
      res.status(403).json({ message: "You are not the assigned candidate for this interview" });
      return;
    }
    res.json(interview);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to join interview", error: errorMessage });
    return;
  }
});

// Report violation
router.post("/:id/violations", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const { type, description } = req.body;
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }

    const violation = await prisma.violation.create({
      data: {
        interviewId: id,
        type,
        description,
      },
    });
    res.status(201).json(violation);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error reporting violation:", err);
    res.status(500).json({ message: "Failed to report violation", error: errorMessage });
    return;
  }
});

// Get interview feedback by ID (added to interviews router)
router.get("/:id/feedback", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { interviewId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    // Ensure only authorized users can view feedback
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview || (interview.interviewerId !== userId && interview.candidateId !== userId)) {
      res.status(403).json({ message: "Access denied: You are not authorized to view this feedback." });
      return;
    }

    res.json(feedback);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error('Error fetching interview feedback:', err);
    res.status(500).json({ message: "Failed to fetch feedback", error: errorMessage });
    return;
  }
});

export default router; 