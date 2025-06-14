import { Request, Response, NextFunction } from 'express';
import { CodeExecutionService } from '../services/codeExecutionService.js';

export class CodeExecutionController {
  private codeExecutionService: CodeExecutionService;

  constructor() {
    this.codeExecutionService = new CodeExecutionService();
  }

  executeCode = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received code execution request:', {
        language: req.body.language,
        problemId: req.body.problemId,
        interviewId: req.body.interviewId,
        testCasesCount: req.body.testCases?.length
      });

      const { 
        code, 
        language, 
        problemId, 
        interviewId,
        testCases,
        problemDetails 
      } = req.body;

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

      const result = await this.codeExecutionService.executeCode(
        code,
        language,
        testCases,
        interviewId,
        problemId,
        problemDetails
      );

      console.log('Code execution result:', {
        message: result.message,
        testResultsCount: result.testResults.length
      });

      res.json(result);
    } catch (error) {
      console.error('Error in executeCode controller:', error);
      res.status(500).json({
        error: 'Internal server error during code execution',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };
} 