import express, { Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router({ mergeParams: true });

// Screenshot storage config
const screenshotStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const interviewId = req.params.id;
    if (!interviewId) {
      console.error('Screenshot upload failed: No interview ID provided');
      cb(new Error('Interview ID is required'), '');
      return;
    }
    const dir = path.join(process.cwd(), 'screenshots', interviewId);
    console.log('Creating screenshot directory:', dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    console.log('Generated screenshot filename:', filename);
    cb(null, filename);
  }
});
const screenshotUpload = multer({ storage: screenshotStorage });

// Upload a screenshot
router.post('/', authenticateJWT, screenshotUpload.single('screenshot'), async (req: MulterRequest, res: Response) => {
  console.log('Received screenshot upload request');
  const { id: interviewId } = req.params;
  const userId = req.user?.id;
  const file = req.file;

  if (!interviewId) {
    console.error('Screenshot upload failed: No interview ID provided');
    return res.status(400).json({ message: 'Interview ID is required' });
  }
  if (!userId) {
    console.error('Screenshot upload failed: No user ID found');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!file) {
    console.error('Screenshot upload failed: No file provided');
    return res.status(400).json({ message: 'No screenshot file provided' });
  }

  console.log('Screenshot uploaded successfully:', {
    interviewId,
    userId,
    filename: file.filename,
    path: file.path
  });

  res.status(201).json({ filename: file.filename, path: file.path });
});

// List all screenshots for an interview
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  console.log('Received request to list screenshots');
  const { id: interviewId } = req.params;
  
  if (!interviewId) {
    console.error('List screenshots failed: No interview ID provided');
    return res.status(400).json({ message: 'Interview ID is required' });
  }
  
  const dir = path.join(process.cwd(), 'screenshots', interviewId);
  console.log('Looking for screenshots in directory:', dir);
  
  if (!fs.existsSync(dir)) {
    console.log('Screenshots directory does not exist');
    return res.json([]);
  }
  
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(f => ({ 
      filename: f, 
      url: `/api/interviews/${interviewId}/screenshots/${f}` 
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));
  
  console.log('Found screenshots:', files);
  res.json(files);
});

// Serve a screenshot file
router.get('/:filename', authenticateJWT, async (req: Request, res: Response) => {
  console.log('Received request to serve screenshot file');
  const { id: interviewId, filename } = req.params;
  const userId = req.user?.id;
  
  if (!interviewId) {
    console.error('Serve screenshot failed: No interview ID provided');
    return res.status(400).json({ message: 'Interview ID is required' });
  }
  if (!userId) {
    console.error('Serve screenshot failed: No user ID found');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!filename) {
    console.error('Serve screenshot failed: No filename provided');
    return res.status(400).json({ message: 'Filename is required' });
  }
  
  const filePath = path.join(process.cwd(), 'screenshots', interviewId, filename);
  console.log('Attempting to serve screenshot from:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('Screenshot file not found:', filePath);
    return res.status(404).json({ message: 'Screenshot not found' });
  }
  
  console.log('Serving screenshot file');
  res.sendFile(filePath);
});

export default router; 