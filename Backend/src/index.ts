import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from 'ws';
import { setupWebSocket } from "./websocket";
import apiRouter from "./routes/index";
import prisma from "./lib/prisma";
import { initializeVectorDb, testVectorDbConnection } from "./lib/vectorDb";
import { testOpenAIConnection } from "./lib/openai";

// Load environment variables from .env file
dotenv.config();

// Create Express app and HTTP server
const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

// --- Service Initialization ---
// Initialize vector database and test connections to required services
async function initializeServices() {
  try {
    // Initialize vector database (for code embeddings)
    await initializeVectorDb();
    
    // Test vector database connection
    const isVectorDbConnected = await testVectorDbConnection();
    if (!isVectorDbConnected) {
      throw new Error('Failed to connect to vector database');
    }
    
    // Test OpenAI connection (for AI-powered features)
    const isOpenAIConnected = await testOpenAIConnection();
    if (!isOpenAIConnected) {
      throw new Error('Failed to connect to OpenAI');
    }
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Service initialization failed:', error);
    process.exit(1);
  }
}

// Start service initialization
initializeServices();

// --- Health Check Endpoint ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- API Routes ---
app.use("/api", apiRouter);

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server });

// Map to store WebSockets for each interview room
const interviewRooms = new Map<string, WebSocket[]>();

// Handle new WebSocket connections
wss.on("connection", (ws: WebSocket, req: Request) => {
  console.log("New WebSocket connection");

  // Handle incoming messages from clients
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

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// --- Start the HTTP and WebSocket server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 