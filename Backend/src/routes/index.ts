import express from "express";
import authRouter from "./auth.ts";
import interviewsRouter from "./interviews.ts";
import snapshotsRouter from "./snapshots.ts";
import notesRouter from "./notes.ts";
import feedbackRouter from "./feedback.ts";
import healthRouter from "./health.ts";
import usersRouter from "./users.ts";
import questionsRouter from "./questions.ts";
import codeExecutionRoutes from './codeExecutionRoutes.ts';

const router = express.Router();

router.use("/auth", authRouter);
router.use("/interviews", interviewsRouter);
router.use("/snapshots", snapshotsRouter);
router.use("/notes", notesRouter);
router.use("/feedback", feedbackRouter);
router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/questions", questionsRouter);
router.use("/code-execution", codeExecutionRoutes);

export default router; 