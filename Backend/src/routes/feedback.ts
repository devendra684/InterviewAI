import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";
import OpenAI from "openai";

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate and save feedback using AI
router.post("/:id/feedback", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const userId = req.user?.id; // req.user is now typed via express.d.ts

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

    const snapshot = await prisma.codeSnapshot.findFirst({
      where: { interviewId },
      orderBy: { timestamp: "desc" }
    });
    if (!snapshot) { res.status(404).json({ message: "No code/transcript snapshot found" }); return; }

    const prompt = `You are an expert technical interviewer. Analyze the following interview transcript and code.\n\nTranscript:\n${snapshot.transcript}\n\nCode:\n${snapshot.code}\n\nEvaluate the candidate on:\n1. Technical skill\n2. Code quality\n3. Communication\n4. Problem solving\n\nFor each, give a score (0-100), and for 'strengths' and 'areas for improvement', provide exactly 2 very concise bullet points each. Then, provide a very brief, detailed feedback paragraph using short sentences. Your response MUST be a JSON object with the following structure, and nothing else:\n{\n  "overallScore": "number",\n  "codeQuality": "number",\n  "problemSolving": "number",\n  "communication": "number",\n  "strengths": "array of 2 very concise strings",\n  "areasForImprovement": "array of 2 very concise strings",\n  "detailedFeedback": "string (very brief paragraph with short sentences)",\n  "nextSteps": "string (concise)"\n}\nIf you cannot provide a score or specific feedback due to insufficient information, use "N/A" for numbers and empty arrays for lists, and explain the reason very concisely in the "detailedFeedback" field.`;
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({message:"OPENAI_API_KEY not configured"});
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let feedbackData: any; // Using any for now due to complex JSON structure
    try {
      const rawContent = response.choices[0].message?.content || "{}";
      console.log("Raw AI response content:", rawContent);

      // Attempt to find the JSON string by looking for the first { and last }
      const startIndex = rawContent.indexOf('{');
      const endIndex = rawContent.lastIndexOf('}');
      let jsonString: string;

      console.log(`startIndex: ${startIndex}, endIndex: ${endIndex}`);

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonString = rawContent.substring(startIndex, endIndex + 1);
      } else {
        console.warn("No valid JSON structure found in AI response, defaulting to empty object.");
        jsonString = "{}";
      }

      console.log("Attempting to parse JSON string:", jsonString);

      feedbackData = JSON.parse(jsonString);

      // If parsing resulted in an empty object (which means AI returned {})
      if (Object.keys(feedbackData).length === 0 && jsonString === "{}") {
        console.warn("AI returned empty JSON, populating with N/A and default detailed feedback.");
        feedbackData = {
          overallScore: "N/A",
          codeQuality: "N/A",
          problemSolving: "N/A",
          communication: "N/A",
          strengths: [],
          areasForImprovement: [],
          detailedFeedback: rawContent, // Use raw content if AI couldn't provide structured JSON
          nextSteps: "Please provide more comprehensive input for a detailed AI analysis."
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      res.status(500).json({ message: "AI response could not be parsed", error: errorMessage });
      return;
    }

    const feedback = await prisma.feedback.create({
      data: {
        overallScore: feedbackData.overallScore,
        strengths: feedbackData.strengths,
        areasForImprovement: feedbackData.areasForImprovement,
        nextSteps: feedbackData.nextSteps,
        interviewId,
        userId,
        codeFeedbackSummary: feedbackData.codeQuality,
        communicationFeedbackSummary: feedbackData.communication,
        feedback: feedbackData.detailedFeedback,
        performance: feedbackData, // Store full JSON response
        transcriptDetailedFeedback: feedbackData.problemSolving,
      }
    });

    res.status(201).json(feedback);
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Failed to generate feedback", error: errorMessage });
    return;
  }
});

export default router; 
// Temporary comment to force re-evaluation 