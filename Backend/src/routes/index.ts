import express from "express";
import authRouter from "./auth";
import interviewsRouter from "./interviews";
import snapshotsRouter from "./snapshots";
import notesRouter from "./notes";
import feedbackRouter from "./feedback";
import healthRouter from "./health";
import usersRouter from "./users";
import questionsRouter from "./questions";
import codeExecutionRoutes from './codeExecutionRoutes';
import screenshotsRouter from "./screenshots";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/questions", questionsRouter);
router.use("/code-execution", codeExecutionRoutes);
router.use("/health", healthRouter);
router.use("/feedback", feedbackRouter);

// Mount screenshots router under interviews
interviewsRouter.use("/:id/screenshots", screenshotsRouter);

// Mount other routers under interviews
interviewsRouter.use("/:id/snapshots", snapshotsRouter);
interviewsRouter.use("/:id/notes", notesRouter);

// Mount interviews router last to avoid path conflicts
router.use("/interviews", interviewsRouter);

export default router; 