import { Router, Request, Response, NextFunction } from 'express';
import { CodeExecutionController } from '../controllers/codeExecutionController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();
const codeExecutionController = new CodeExecutionController();

router.post(
  '/execute',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await codeExecutionController.executeCode(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;