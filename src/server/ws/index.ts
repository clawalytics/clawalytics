import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export type WsEventType =
  | 'costs:updated'
  | 'session:new'
  | 'alert:new'
  | 'device:changed'
  | 'desktop:close-requested';

export interface WsEvent {
  type: WsEventType;
  data?: unknown;
  timestamp: string;
}

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('error', (err) => {
      console.error('WebSocket client error:', err.message);
    });

    // Send initial ping
    ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
  });

  console.log('WebSocket server initialized at /ws');
  return wss;
}

export function broadcast(event: WsEvent): void {
  if (!wss) return;

  const message = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function broadcastCostsUpdated(): void {
  broadcast({
    type: 'costs:updated',
    timestamp: new Date().toISOString(),
  });
}

export function broadcastNewSession(sessionId: string): void {
  broadcast({
    type: 'session:new',
    data: { sessionId },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastNewAlert(alertId: number, severity: string): void {
  broadcast({
    type: 'alert:new',
    data: { alertId, severity },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastDeviceChanged(deviceId: string): void {
  broadcast({
    type: 'device:changed',
    data: { deviceId },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastDesktopCloseRequested(): void {
  broadcast({
    type: 'desktop:close-requested',
    timestamp: new Date().toISOString(),
  });
}

export function closeWebSocket(): void {
  if (wss) {
    wss.close();
    wss = null;
  }
}
