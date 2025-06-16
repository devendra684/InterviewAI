import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRecruiterOrAdmin } from "../middleware/roleCheck.js";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check database connection (for health checks or before critical operations)
const checkDatabaseConnection = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown database error occurred";
    res.status(500).json({
      message: "Database connection error",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
  }
};

// Create a new question
router.post("/", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { title, description, difficulty, testCases } = req.body;
  const userId = req.user?.id;

  // Enhanced logging for debugging
  console.log('Request body:', req.body);
  console.log('User from JWT:', req.user);
  console.log('Extracted userId:', userId);
  console.log('UserId type:', typeof userId);

  if (!userId) {
    console.log('No userId found in request');
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  if (typeof userId !== 'string' || userId.trim() === '') {
    console.log('Invalid userId format:', userId);
    res.status(401).json({ message: "Invalid user ID format" });
    return;
  }

  if (!title || !description || !testCases) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // Check if user exists in database
  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userExists) {
      console.log('User not found in database:', userId);
      res.status(401).json({ message: "User not found in database" });
      return;
    }
    
    console.log('User found in database:', userExists.email);
  } catch (userCheckError) {
    console.error('Error checking user existence:', userCheckError);
    res.status(500).json({ message: "Error validating user" });
    return;
  }

  const questionData = {
    title: String(title),
    description: String(description),
    difficulty: difficulty || 'MEDIUM',
    testCases,
    user: { // Connect the question to the user via the 'user' relation
      connect: { id: userId }
    },
  };

  console.log('Creating question with data:', questionData);

  try {
    const question = await prisma.question.create({
      data: questionData,
      include: {
        user: { // Use 'user' for the include statement to fetch user details
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Question created successfully:', question.id);
    res.status(201).json(question);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error('Error creating question:', err);
    console.error('Full error details:', JSON.stringify(err, null, 2));
    res.status(500).json({
      message: "Failed to create question",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
    return;
  }
});

// Get all questions
router.get("/", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        user: { // Changed from createdBy to user to match schema relation
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.status(200).json(questions);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error('Error fetching questions:', err);
    res.status(500).json({
      message: "Failed to fetch questions",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
    return;
  }
});

// Get a specific question
router.get("/:id", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: { // Changed from createdBy to user to match schema relation
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    res.json(question);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error fetching question by ID:", err);
    res.status(500).json({
      message: "Failed to fetch question",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
    return;
  }
});

// Update a question
router.put("/:id", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, difficulty, testCases } = req.body; // Removed category and solution
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    if (question.createdById !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        testCases
      }
    });

    res.json(updatedQuestion);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error('Error updating question:', err);
    res.status(500).json({
      message: "Failed to update question",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
    return;
  }
});

// Delete a question
router.delete("/:id", authenticateJWT, requireRecruiterOrAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    if (question.createdById !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await prisma.question.delete({
      where: { id }
    });

    res.status(204).send();
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error('Error deleting question:', err);
    res.status(500).json({
      message: "Failed to delete question",
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
    });
    return;
  }
});

export default router;