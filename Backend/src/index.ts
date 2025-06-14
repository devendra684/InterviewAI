import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from 'ws';
import { setupWebSocket } from "./websocket.ts";
import apiRouter from "./routes/index.ts";
import prisma from "./lib/prisma.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", apiRouter);

const server = createServer(app);
const wss = new WebSocketServer({ server });

const interviewRooms = new Map<string, WebSocket[]>(); // Map to store WebSockets for each interview room

wss.on("connection", (ws: WebSocket, req: Request) => {
  console.log("New WebSocket connection");

  // Handle messages
  ws.on("message", (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received:", data);

      // Handle different message types
      switch (data.type) {
        case "join_interview":
          // Handle interview join
          break;
        case "code_update":
          // Handle code updates
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 