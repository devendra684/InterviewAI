import express from "express";
import prisma from "../lib/prisma.ts";

const router = express.Router();

// Health check endpoint
router.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: true });
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ status: "error", db: false, error: errorMessage });
    return;
  }
});

export default router; 