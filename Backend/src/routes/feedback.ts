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

    const prompt = `You are an expert technical interviewer. Analyze the following interview transcript and code. Consider the provided test results for code quality assessment.

Transcript:
${transcriptData.content}

Code:
${snapshot.code}

Test Results:
${snapshot.testResults ? JSON.stringify(snapshot.testResults, null, 2) : "No test results provided."}

Evaluate the candidate on:
1. Technical skill
2. Code quality (evaluate efficiency, readability, best practices, AND correctness based on test results)
3. Communication (analyze clarity, articulation, and interaction)
4. Problem solving

For each category, provide:
- A score (0-100) as a NUMBER
- 2 specific strengths
- 2 specific areas for improvement

For code quality specifically, evaluate:
- Code efficiency (time/space complexity)
- Readability (naming, structure, comments)
- Best practices (error handling, modularity)
- Correctness (based on test results: total tests, passed tests, failed tests, and any error messages).

For communication, analyze:
- Clarity of explanations
- Technical vocabulary usage
- Interaction quality
- Response to feedback

Additional Communication Metrics:
${transcriptData.communicationMetrics ? `- Clarity Score: ${transcriptData.communicationMetrics.clarity}
- Technical Accuracy: ${transcriptData.communicationMetrics.technicalAccuracy}
- Response Time: ${transcriptData.communicationMetrics.responseTime}
- Engagement Level: ${transcriptData.communicationMetrics.engagement}` : ''}

IMPORTANT: Your response MUST be a valid JSON object with numeric scores (not strings). For code quality, ensure your 'score' and sub-evaluations accurately reflect the test results. Use the following structure:
{
  "overallScore": 75,
  "technicalSkill": 80,
  "codeQuality": {
    "score": 70,
    "efficiency": "Good time complexity but could optimize space usage",
    "readability": "Well-structured code with clear variable names",
    "bestPractices": "Missing error handling in some areas",
    "correctness": "Passed 2 out of 3 test cases. Failing test case details: ..."
  },
  "communication": {
    "score": 85,
    "clarity": "Explained concepts clearly with good examples",
    "technicalVocabulary": "Used appropriate technical terms correctly",
    "interaction": "Responded well to questions and feedback",
    "metrics": {
      "clarity": 80,
      "technicalAccuracy": 90,
      "responseTime": 75,
      "engagement": 85
    }
  },
  "problemSolving": 78,
  "strengths": ["Strong algorithmic thinking", "Good debugging skills"],
  "areasForImprovement": ["Could improve edge case handling", "Need better time complexity analysis"],
  "detailedFeedback": "The candidate demonstrated solid technical skills with room for improvement in optimization techniques.",
  "nextSteps": "Focus on advanced algorithms and system design concepts"
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
        technicalSkill: 0,
        codeQuality: {
          score: 0,
          efficiency: "Unable to evaluate due to insufficient data",
          readability: "Unable to evaluate due to insufficient data",
          bestPractices: "Unable to evaluate due to insufficient data",
          correctness: "Unable to evaluate due to insufficient data"
        },
        communication: {
          score: 0,
          clarity: "Unable to evaluate due to insufficient data",
          technicalVocabulary: "Unable to evaluate due to insufficient data",
          interaction: "Unable to evaluate due to insufficient data",
          metrics: {
            clarity: 0,
            technicalAccuracy: 0,
            responseTime: 0,
            engagement: 0
          }
        },
        problemSolving: 0,
        strengths: [],
        areasForImprovement: [],
        detailedFeedback: "Unable to generate feedback due to AI response parsing error. Please try again with more comprehensive interview data.",
        nextSteps: "Ensure interview transcript and code are properly captured for accurate feedback generation."
      };
    }

    console.log("Creating feedback record in database");
    const feedback = await prisma.feedback.create({
      data: {
        overallScore: feedbackData.overallScore,
        strengths: feedbackData.strengths,
        areasForImprovement: feedbackData.areasForImprovement,
        nextSteps: feedbackData.nextSteps,
        interviewId,
        userId,
        codeFeedbackSummary: JSON.stringify(feedbackData.codeQuality),
        communicationFeedbackSummary: JSON.stringify(feedbackData.communication),
        feedback: feedbackData.detailedFeedback,
        performance: feedbackData,
        transcriptDetailedFeedback: feedbackData.problemSolving.toString(),
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