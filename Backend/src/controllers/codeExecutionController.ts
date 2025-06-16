import { Request, Response, NextFunction } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService.js';

// Controller for handling code execution API requests
export class CodeExecutionController {
  private codeExecutionService: CodeExecutionService;

  constructor() {
    this.codeExecutionService = new CodeExecutionService();
  }

  // Handle POST /code-execution/execute
  // Receives code, language, test cases, and problem details from the client
  // Runs code execution, collects results, and returns them to the client
  executeCode = async (req: Request, res: Response): Promise<void> => {
    try {
      // Log incoming request details
      console.log('Received code execution request:', {
        language: req.body.language,
        problemId: req.body.problemId,
        interviewId: req.body.interviewId,
        testCasesCount: req.body.testCases?.length
      });

      // Extract required fields from request body
      const { 
        code, 
        language, 
        problemId, 
        interviewId,
        testCases,
        problemDetails 
      } = req.body;

      // Validate required fields
      if (!code || !language || !testCases || !interviewId || !problemDetails) {
        console.error('Missing required fields:', { 
          code: !!code, 
          language: !!language, 
          testCases: !!testCases,
          interviewId: !!interviewId,
          problemDetails: !!problemDetails
        });
        res.status(400).json({
          error: 'Missing required fields',
          details: {
            code: !code ? 'Code is required' : null,
            language: !language ? 'Language is required' : null,
            testCases: !testCases ? 'Test cases are required' : null,
            interviewId: !interviewId ? 'Interview ID is required' : null,
            problemDetails: !problemDetails ? 'Problem details are required' : null
          }
        });
        return;
      }

      // Run code execution and get results
      const result = await this.codeExecutionService.executeCode(
        code,
        language,
        testCases,
        interviewId,
        problemId,
        problemDetails
      );

      // Log and return the result
      console.log('Code execution result:', {
        message: result.message,
        testResultsCount: result.testResults.length
      });

      res.json(result);
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in executeCode controller:', error);
      res.status(500).json({
        error: 'Internal server error during code execution',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };
} 