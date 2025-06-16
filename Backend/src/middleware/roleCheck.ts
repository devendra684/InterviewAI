import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js"; // adjust path

export const requireRecruiterOrAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied: Requires recruiter or admin role" });
    return;
  }

  next();
  return;
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized: User not found" });
    return;
  }

  if (user.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied: Requires admin role" });
    return;
  }

  next();
  return;
}; 