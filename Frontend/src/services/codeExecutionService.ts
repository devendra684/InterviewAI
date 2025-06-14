import { TestCase } from '../types/interview';

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
    statusMessage?: string;
  };
}

export class CodeExecutionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    console.log('CodeExecutionService initialized with baseUrl:', this.baseUrl);
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
    },
    token: string
  ): Promise<CodeExecutionResult> {
    try {
      console.log('Executing code:', {
        language,
        interviewId,
        problemId,
        testCasesCount: testCases.length,
        codeLength: code.length
      });

      const response = await fetch(`${this.baseUrl}/code-execution/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          testCases,
          interviewId,
          problemId,
          problemDetails
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Code execution successful:', {
        message: result.message,
        testResultsCount: result.testResults.length
      });

      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }
} 