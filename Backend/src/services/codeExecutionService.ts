import { TestCase } from '../types/interview';
import { AIService } from './aiService.js';
import { PrismaClient } from '@prisma/client';

interface CodeExecutionResult {
  message: string;
  testResults: {
    testCase: number;
    passed: boolean;
    executionTime: string;
    output?: string;
    error?: string;
  }[];
  aiInsights?: {
    suggestions: string[];
    potentialBugs: string[];
    alternativeSolutions: string[];
  };
}

export class CodeExecutionService {
  private aiService: AIService;
  private prisma: PrismaClient;

  constructor() {
    this.aiService = new AIService();
    this.prisma = new PrismaClient();
  }

  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    interviewId: string,
    problemId: string,
    problemDetails: {
      title: string;
      description: string;
      difficulty: string;
    }
  ): Promise<CodeExecutionResult> {
    try {
      // TODO: Implement actual code execution based on language
      // This is where you'd integrate with a code execution engine
      // For now, we'll simulate the execution

      const testResults = await this.runTestCases(code, language, testCases);
      const allPassed = testResults.every(result => result.passed);
      
      // Save code snapshot with problem context
      try {
        await this.prisma.codeSnapshot.create({
          data: {
            interview: { connect: { id: interviewId } },
            code,
            language,
            filename: 'solution.js',
            transcript: `Problem: ${problemDetails.title}\nDifficulty: ${problemDetails.difficulty}\nDescription: ${problemDetails.description}\n\nCode Execution Results:\n${testResults.map(r => `Test ${r.testCase}: ${r.passed ? 'PASSED' : 'FAILED'}`).join('\n')}`,
          },
        });
        console.log('Code snapshot saved successfully for interview:', interviewId, 'problem:', problemId);
      } catch (snapshotError: any) {
        console.error('Error saving code snapshot for interview:', interviewId, 'problem:', problemId, snapshotError);
      }
      
      // Analyze code with AI service, including problem context
      const aiInsights = await this.aiService.analyzeCode(
        code, 
        language, 
        testResults,
        {
          problemTitle: problemDetails.title,
          problemDescription: problemDetails.description,
          difficulty: problemDetails.difficulty
        }
      );
      
      return {
        message: allPassed 
          ? "All test cases passed!" 
          : `${testResults.filter(r => !r.passed).length} test case(s) failed.`,
        testResults,
        aiInsights
      };
    } catch (error) {
      console.error('Code execution error:', error);
      return {
        message: "Error executing code. Please check your syntax.",
        testResults: []
      };
    }
  }

  private async runTestCases(
    code: string,
    language: string,
    testCases: TestCase[]
  ) {
    // TODO: Implement actual test case execution
    // This would involve:
    // 1. Compiling/parsing the code
    // 2. Running each test case
    // 3. Comparing outputs
    // For now, we'll simulate the results

    return testCases.map((testCase, index) => ({
      testCase: index + 1,
      passed: Math.random() > 0.3, // Simulate some failures
      executionTime: `${Math.floor(Math.random() * 20)}ms`,
      output: "Simulated output",
      error: Math.random() > 0.7 ? "Simulated error" : undefined
    }));
  }

  private validateSyntax(code: string, language: string): boolean {
    // TODO: Implement actual syntax validation
    // This would involve:
    // 1. Language-specific syntax checking
    // 2. Basic code structure validation
    return true;
  }
} 