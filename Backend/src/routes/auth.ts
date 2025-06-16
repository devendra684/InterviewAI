import express from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
// import nodemailer from "nodemailer"; // For future SMTP integration

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req: express.Request, res: express.Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const validRoles = ["ADMIN", "RECRUITER", "CANDIDATE"];
  if (role && !validRoles.includes(role.toUpperCase())) {
    res.status(400).json({ message: "Invalid user role provided." });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: role ? role.toUpperCase() : undefined
      },
    });
    // TODO: Send verification email via SMTP
    // await sendVerificationEmail(user.email, ...);
    res.status(201).json({ message: "User registered. Email verification pending." });
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Registration failed", error: errorMessage });
    return;
  }
});

// Login
router.post("/login", async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    return;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    res.status(500).json({ message: "Login failed", error: errorMessage });
    return;
  }
});

// Placeholder for email verification (to be implemented)
router.post("/verify-email", (req, res) => {
  res.status(501).json({ message: "Email verification not implemented yet." });
});

export default router; 