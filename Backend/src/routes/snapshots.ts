import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Save a new snapshot (code + transcript)
router.post("/:id/snapshot", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const { filename, language, code, transcript } = req.body;
  const userId = req.user?.id;

  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    // Check interview access
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    const snapshot = await prisma.codeSnapshot.create({
      data: { interviewId, filename, language, code, transcript }
    });
    res.status(201).json(snapshot);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to save snapshot", error: errorMessage });
    return;
  }
});

// Get all snapshots for an interview
router.get("/:id/snapshots", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const userId = req.user?.id;

  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    const snapshots = await prisma.codeSnapshot.findMany({
      where: { interviewId },
      orderBy: { timestamp: "asc" }
    });
    res.json(snapshots);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to fetch snapshots", error: errorMessage });
    return;
  }
});

// Get latest snapshot for an interview
router.get("/:id/snapshot/latest", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const userId = req.user?.id;

  if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

  try {
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { res.status(404).json({ message: "Interview not found" }); return; }
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    const snapshot = await prisma.codeSnapshot.findFirst({
      where: { interviewId },
      orderBy: { timestamp: "desc" }
    });
    if (!snapshot) { res.status(404).json({ message: "No snapshots found" }); return; }
    res.json(snapshot);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to fetch latest snapshot", error: errorMessage });
    return;
  }
});

export default router; 