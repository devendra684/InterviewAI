import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Save a new note for an interview
router.post("/:id/notes", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  try {
    // Check interview access
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const note = await prisma.interviewNote.create({
      data: { interviewId, userId, content }
    });
    res.status(201).json(note);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to add note", error: errorMessage });
    return;
  }
});

// Get all notes for an interview
router.get("/:id/notes", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }
  
  try {
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const notes = await prisma.interviewNote.findMany({
      where: { interviewId },
      orderBy: { timestamp: "asc" }
    });
    res.json(notes);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to fetch notes", error: errorMessage });
    return;
  }
});

export default router; 