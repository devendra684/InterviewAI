import express, { Request, Response } from "express";
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

interface Client {
  id: string;
  userId: string;
  interviewId: string;
  ws: WebSocket;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

const clients: Map<string, Client> = new Map();

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: Request) => {
    const clientId = uuidv4();
    const userId = req.headers['user-id'] as string;
    const interviewId = req.headers['interview-id'] as string;

    if (!userId || !interviewId) {
      ws.close();
      return;
    }

    const client: Client = {
      id: clientId,
      userId,
      interviewId,
      ws
    };

    clients.set(clientId, client);
    console.log(`Client connected: ${clientId} (User: ${userId}, Interview: ${interviewId})`);

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data) as WebSocketMessage;
        handleMessage(client, message);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
    });
  });
}

async function handleMessage(client: Client, message: WebSocketMessage) {
  const { type, payload } = message;

  switch (type) {
    case "code_update":
      // Broadcast code updates to other clients in the same interview
      broadcastToInterview(client.interviewId, {
        type: "code_update",
        payload: {
          ...payload,
          userId: client.userId
        }
      }, client.id);
      break;

    case "notes_update":
      // Broadcast notes updates to other clients in the same interview
      broadcastToInterview(client.interviewId, {
        type: "notes_update",
        payload: {
          ...payload,
          userId: client.userId
        }
      }, client.id);
      break;

    default:
      console.log("Unknown message type:", type);
  }
}

function broadcastToInterview(interviewId: string, message: WebSocketMessage, excludeClientId?: string) {
  for (const [clientId, client] of clients.entries()) {
    if (client.interviewId === interviewId && clientId !== excludeClientId) {
      client.ws.send(JSON.stringify(message));
    }
  }
} 