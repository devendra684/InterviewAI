import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get user by email
router.get("/by-email/:email", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { email } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error finding user by email:", err);
    res.status(500).json({ message: "Failed to find user", error: errorMessage });
    return;
  }
});

export default router; 