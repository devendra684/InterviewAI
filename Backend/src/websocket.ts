import { WebSocketServer, WebSocket as WsWebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';
import * as fs from 'fs';
import * as path from 'path';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface Client {
  id: string;
  ws: WsWebSocket;
  interviewId: string;
  userId: string;
  role: string;
}

const clients = new Map<string, Client>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const { query } = parse(req.url || '', true);
    const { interviewId, userId, role } = query;

    if (!interviewId || !userId || !role) {
      ws.close(1008, 'Missing required parameters');
      return;
    }

    const client: Client = {
      id: userId as string,
      ws,
      interviewId: interviewId as string,
      userId: userId as string,
      role: role as string
    };

    clients.set(client.id, client);
    console.log(`Client connected: ${client.id} (${client.role})`);

    ws.on('message', (data) => {
      const text = typeof data === 'string' ? data : data.toString();
       try {
        const message: WebSocketMessage = JSON.parse(text);
        handleMessage(client, message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(client.id);
      console.log(`Client disconnected: ${client.id}`);
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

    case "screenshot":
      const { interviewId, userId, timestamp, data } = payload;
      const filename = `${interviewId}-${userId}-${timestamp}.png`;
      const filepath = path.join(__dirname, '..', '..', 'screenshots', filename);
  await fs.promises.mkdir(path.dirname(filepath), { recursive: true });

      // Convert Array<number> back to Buffer
      const buffer = Buffer.from(data);

      fs.writeFile(filepath, buffer, (err) => {
        if (err) {
          console.error("Error saving screenshot:", err);
        } else {
          console.log(`Screenshot saved: ${filepath}`);
        }
      });
      break;

    default:
      console.log("Unknown message type:", type);
  }
}

function broadcastToInterview(interviewId: string, message: WebSocketMessage, excludeClientId?: string) {
  clients.forEach((client) => {
    if (client.interviewId === interviewId && client.id !== excludeClientId) {
      client.ws.send(JSON.stringify(message));
    }
  });
} 