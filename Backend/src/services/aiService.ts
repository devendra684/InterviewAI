import { OpenAI } from 'openai';

interface TestResult {
  testCase: number;
  passed: boolean;
  output?: string;
  error?: string;
}

// Service for AI-powered code analysis and feedback using OpenAI
export class AIService {
  private openai: OpenAI;

  constructor() {
    console.log('AI Service initialized');
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // Analyze code and test results, return suggestions and potential bugs using OpenAI
  async analyzeCode(
    code: string,
    language: string,
    testResults: TestResult[],
    problemDetails: {
      problemTitle: string;
      problemDescription: string;
      difficulty: string;
    }
  ): Promise<{
    suggestions: string[];
    potentialBugs: string[];
  }> {
    console.log(`Analyzing code in ${language} with ${testResults.length} test results.`);

    // Prepare a summary of test results for the AI prompt
    const testResultsSummary = testResults.map(tr => 
      `Test Case ${tr.testCase}: ${tr.passed ? 'PASSED' : 'FAILED'} - Output: ${tr.output || 'N/A'} - Error: ${tr.error || 'N/A'}`
    ).join('\n');

    // Construct the prompt for OpenAI
    const prompt = `You are an expert code analyst. Analyze the following code, its language, the problem it attempts to solve, and its test results and always use 'Input' as the variable name to receive input values from test cases. Provide suggestions for improvement, identify potential bugs.

Problem Title: ${problemDetails.problemTitle}
Problem Description: ${problemDetails.problemDescription}
Problem Difficulty: ${problemDetails.difficulty}

Language: ${language}

Code:
\${language}
${code}
\

Test Results:
${testResultsSummary}

Provide your analysis as a JSON object with the following structure. For array fields (suggestions, potentialBugs), provide exactly 2 very concise points each, and each point must be a short and single line (no line breaks or multi-line explanations):
{
  "suggestions": [
    "string"
  ],
  "potentialBugs": [
    "string"
  ]
}
If no relevant data, use empty arrays.`;

    try {
      // Call OpenAI API for code analysis
      const response = await this.openai.chat.completions.create({
        model: "gpt-4", // Or a suitable model like gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const rawContent = response.choices[0].message?.content || "{}";
      console.log("Raw AI analyzeCode response:", rawContent);

      // Attempt to find the JSON string by looking for the first { and last }
      const startIndex = rawContent.indexOf('{');
      const endIndex = rawContent.lastIndexOf('}');
      let jsonString: string;

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonString = rawContent.substring(startIndex, endIndex + 1);
      } else {
        console.warn("No valid JSON structure found in AI analyzeCode response, defaulting to empty object.");
        jsonString = "{}";
      }

      const parsedInsights = JSON.parse(jsonString);

      return {
        suggestions: parsedInsights.suggestions || [],
        potentialBugs: parsedInsights.potentialBugs || [],
      };
    } catch (error) {
      console.error("Error analyzing code with AI:", error);
      return {
        suggestions: ["Failed to get AI suggestions."],
        potentialBugs: ["Failed to get AI potential bugs."],
      };
    }
  }

  // Provide feedback for a failed test case using OpenAI
  async provideFeedback(
    code: string,
    language: string,
    testResults: TestResult[],
    expectedOutput: string,
    actualOutput: string
  ): Promise<any> {
    console.log(`Providing feedback for code in ${language}.`);
    
    // Construct the prompt for OpenAI
    const prompt = `The following code in ${language} was expected to produce output: \"${expectedOutput}\" but instead produced: \"${actualOutput}\". The code is: \n\${language}\n${code}\n\\nExplain why the test failed and provide exactly 2 very concise, actionable guidance points on how to fix it, using short sentences.`;

    try {
      // Call OpenAI API for feedback
      const response = await this.openai.chat.completions.create({
        model: "gpt-4", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const feedbackContent = response.choices[0].message?.content || '';
      console.log("Raw AI provideFeedback response:", feedbackContent);

      return {
        feedback: feedbackContent
      };
    } catch (error) {
      console.error("Error providing feedback with AI:", error);
      return {
        feedback: "Failed to generate specific feedback."
      };
    }
  }
}
