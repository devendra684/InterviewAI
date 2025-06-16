import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/auth.js";
import OpenAI from "openai";

const router = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to validate and convert scores
const validateScore = (score: any): number => {
  if (typeof score === 'number' && !isNaN(score) && score >= 0 && score <= 100) {
    return score;
  }
  if (typeof score === 'string') {
    const parsed = parseInt(score);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      return parsed;
    }
  }
  return 0; // Default to 0 for invalid scores
};

// Helper function to validate feedback data
const validateFeedbackData = (data: any) => {
  return {
    overallScore: validateScore(data.overallScore),
    technicalSkill: validateScore(data.technicalSkill),
    codeQuality: {
      score: validateScore(data.codeQuality?.score),
      efficiency: data.codeQuality?.efficiency || "Not evaluated",
      readability: data.codeQuality?.readability || "Not evaluated",
      bestPractices: data.codeQuality?.bestPractices || "Not evaluated",
      correctness: data.codeQuality?.correctness || "Not evaluated"
    },
    communication: {
      score: validateScore(data.communication?.score),
      clarity: data.communication?.clarity || "Not evaluated",
      technicalVocabulary: data.communication?.technicalVocabulary || "Not evaluated",
      interaction: data.communication?.interaction || "Not evaluated",
      metrics: {
        clarity: validateScore(data.communication?.metrics?.clarity),
        technicalAccuracy: validateScore(data.communication?.metrics?.technicalAccuracy),
        responseTime: validateScore(data.communication?.metrics?.responseTime),
        engagement: validateScore(data.communication?.metrics?.engagement)
      }
    },
    problemSolving: validateScore(data.problemSolving),
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    areasForImprovement: Array.isArray(data.areasForImprovement) ? data.areasForImprovement : [],
    detailedFeedback: data.detailedFeedback || "No detailed feedback available",
    nextSteps: data.nextSteps || "No next steps provided"
  };
};

// Generate and save feedback using AI
router.post("/:id/feedback", authenticateJWT, async (req: express.Request, res: express.Response): Promise<void> => {
  const { id: interviewId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  try {
    console.log(`Generating feedback for interview ${interviewId} by user ${userId}`);

    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) { 
      console.log(`Interview ${interviewId} not found`);
      res.status(404).json({ message: "Interview not found" }); 
      return; 
    }
    
    if (interview.interviewerId !== userId && interview.candidateId !== userId) {
      console.log(`Access denied for user ${userId} to interview ${interviewId}`);
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { interviewId },
      include: {
        interview: {
          include: {
            codeSnapshots: {
              orderBy: { timestamp: 'desc' },
              take: 1,
              select: {
                testResults: true
              }
            }
          }
        }
      }
    });

    if (existingFeedback) {
      console.log(`Feedback already exists for interview ${interviewId}`);
      // Add testResults to the response
      const response = {
        ...existingFeedback,
        codeFeedbackSummary: {
          ...(existingFeedback.codeFeedbackSummary as any),
          testResults: existingFeedback.interview?.codeSnapshots[0]?.testResults || []
        }
      };
      res.status(200).json(response);
      return;
    }

    const snapshot = await prisma.codeSnapshot.findFirst({
      where: { interviewId },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        filename: true,
        language: true,
        code: true,
        transcript: true,
        timestamp: true,
        testResults: true,
      }
    });
    
    if (!snapshot) { 
      console.log(`No code/transcript snapshot found for interview ${interviewId}`);
      res.status(404).json({ message: "No code/transcript snapshot found" }); 
      return; 
    }

    // Parse the enhanced transcript
    let transcriptData;
    try {
      transcriptData = JSON.parse(snapshot.transcript);
    } catch (e) {
      console.log(`Failed to parse transcript for interview ${interviewId}:`, e);
      transcriptData = { content: snapshot.transcript };
    }

    console.log(`Generating AI feedback for interview ${interviewId}`);
    console.log("AI Prompt - Transcript content:", transcriptData.content);
    console.log("AI Prompt - Code content:", snapshot.code);
    console.log("AI Prompt - Test Results:", snapshot.testResults);

    const prompt = `You are an expert technical interviewer. Analyze the following interview transcript and code. Consider the provided test results for code quality assessment and 'Input' as the variable name to receive input values from test cases.

Transcript:
${transcriptData.content}

Code:
${snapshot.code}

Test Results:
${snapshot.testResults ? JSON.stringify(snapshot.testResults, null, 2) : "No test results provided."}

Evaluate the candidate on:
1. Overall performance
2. Problem solving ability
3. Technical skill
4. Code quality (evaluate efficiency, readability, best practices, AND correctness)

For code quality specifically, evaluate:
- Efficiency (time/space complexity)
- Readability (naming, structure, comments)
- Best practices (error handling, modularity)
- Correctness (based on test results: total tests, passed tests, failed tests, and any error messages).

For each section, also provide:
- 2 specific strengths (as an array of short strings)
- 2 specific areas for improvement (as an array of short strings)

IMPORTANT: Your response MUST be a valid JSON object with numeric scores (not strings). For code quality, include a numeric 'score' field (0-100) and the subfields. Use the following structure:
{
  "overallScore": 75,
  "problemSolving": 80,
  "technicalSkill": 85,
  "codeQuality": {
    "score": 70,
    "efficiency": "...",
    "readability": "...",
    "bestPractices": "...",
    "correctness": "..."
  },
  "strengths": ["...", "..."],
  "areasForImprovement": ["...", "..."],
  "detailedFeedback": "..."
}

If you cannot evaluate due to insufficient information, use score 0 and explain in detailedFeedback.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let feedbackData;
    try {
      const rawContent = response.choices[0].message?.content || "{}";
      console.log("Raw AI response:", rawContent);
      
      const startIndex = rawContent.indexOf('{');
      const endIndex = rawContent.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        throw new Error("No valid JSON found in AI response");
      }

      const jsonString = rawContent.substring(startIndex, endIndex + 1);
      feedbackData = JSON.parse(jsonString);
      feedbackData = validateFeedbackData(feedbackData);

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      feedbackData = {
        overallScore: 0,
        problemSolving: 0,
        technicalSkill: 0,
        codeQuality: {
          efficiency: "Unable to evaluate due to insufficient data",
          readability: "Unable to evaluate due to insufficient data",
          bestPractices: "Unable to evaluate due to insufficient data",
          correctness: "Unable to evaluate due to insufficient data"
        },
        detailedFeedback: "Unable to generate feedback due to AI response parsing error. Please try again with more comprehensive interview data."
      };
    }

    console.log("Creating feedback record in database");
    const feedback = await prisma.feedback.create({
      data: {
        overallScore: feedbackData.overallScore || 0,
        strengths: feedbackData.strengths ?? [],
        areasForImprovement: feedbackData.areasForImprovement ?? [],
        nextSteps: "No next steps provided",
        interviewId,
        userId,
        codeFeedbackSummary: JSON.stringify({
          score: feedbackData.codeQuality?.score ?? 0,
          efficiency: feedbackData.codeQuality?.efficiency || "Not evaluated",
          readability: feedbackData.codeQuality?.readability || "Not evaluated",
          bestPractices: feedbackData.codeQuality?.bestPractices || "Not evaluated",
          correctness: feedbackData.codeQuality?.correctness || "Not evaluated"
        }),
        communicationFeedbackSummary: JSON.stringify({
          score: 0,
          clarity: "Not evaluated",
          technicalVocabulary: "Not evaluated",
          interaction: "Not evaluated",
          metrics: {
            clarity: 0,
            technicalAccuracy: 0,
            responseTime: 0,
            engagement: 0
          }
        }),
        feedback: feedbackData.detailedFeedback || "No detailed feedback available",
        performance: {
          overallScore: feedbackData.overallScore || 0,
          technicalSkill: feedbackData.technicalSkill || 0,
          codeQuality: {
            score: feedbackData.codeQuality?.score ?? 0,
            efficiency: feedbackData.codeQuality?.efficiency || "Not evaluated",
            readability: feedbackData.codeQuality?.readability || "Not evaluated",
            bestPractices: feedbackData.codeQuality?.bestPractices || "Not evaluated",
            correctness: feedbackData.codeQuality?.correctness || "Not evaluated"
          },
          communication: {
            score: 0,
            clarity: "Not evaluated",
            technicalVocabulary: "Not evaluated",
            interaction: "Not evaluated",
            metrics: {
              clarity: 0,
              technicalAccuracy: 0,
              responseTime: 0,
              engagement: 0
            }
          },
          problemSolving: feedbackData.problemSolving || 0,
          strengths: feedbackData.strengths ?? [],
          areasForImprovement: feedbackData.areasForImprovement ?? [],
          detailedFeedback: feedbackData.detailedFeedback || "No detailed feedback available",
          nextSteps: "No next steps provided"
        },
        transcriptDetailedFeedback: feedbackData.problemSolving?.toString() || "0"
      }
    });

    // Add testResults to the response
    const responseWithTestResults = {
      ...feedback,
      codeFeedbackSummary: {
        ...(feedback.codeFeedbackSummary as any),
        testResults: snapshot.testResults || []
      }
    };

    console.log(`Feedback generated successfully for interview ${interviewId}`);
    res.status(200).json(responseWithTestResults);
    return;
    
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error generating feedback:", err);
    res.status(500).json({ message: "Failed to generate feedback", error: errorMessage });
    return;
  }
});

export default router;