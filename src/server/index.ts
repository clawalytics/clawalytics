import cors from 'cors';
import express from 'express';
import { realpathSync } from 'fs';
import type { Server } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import auditRoutes from './routes/audit.js';
import agentsRoutes from './routes/agents.js';
import channelsRoutes from './routes/channels.js';
import configRoutes from './routes/config.js';
import costsRoutes from './routes/costs.js';
import desktopRoutes from './routes/desktop.js';
import devicesRoutes from './routes/devices.js';
import exportRoutes from './routes/export.js';
import modelsRoutes from './routes/models.js';
import securityRoutes from './routes/security.js';
import sessionsRoutes from './routes/sessions.js';
import statsRoutes from './routes/stats.js';
import tokensRoutes from './routes/tokens.js';
import toolsRoutes from './routes/tools.js';
import trendsRoutes from './routes/trends.js';
import { ensureConfigDir, loadConfig } from './config/loader.js';
import { closeDatabase, getDatabase } from './db/schema.js';
import { startSecurityWatcher, stopSecurityWatcher } from './parser/security-watcher.js';
import { clearDesktopBridge, setDesktopBridge } from './services/desktop-service.js';
import {
  initializeAnalyticsService,
  shutdownAnalyticsService,
} from './services/analytics-service.js';
import { initPricingService } from './services/pricing-service.js';
import {
  broadcastDesktopCloseRequested,
  closeWebSocket,
  initWebSocket,
} from './ws/index.js';

import type { Express } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PORT = 9174;

const app: Express = express();
const clientPath = path.join(__dirname, '../client');

let httpServer: Server | null = null;
let activePort: number | null = null;
let signalHandlersRegistered = false;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production (before API routes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientPath, { index: 'index.html' }));
}

// API routes
app.use('/api/stats', statsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/costs', costsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/desktop', desktopRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for non-API routes (must be after API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(clientPath, 'index.html'));
    return;
  }

  next();
});

export interface StartServerOptions {
  port?: number;
}

export interface StartedServer {
  port: number;
  server: Server;
}

function resolvePort(port?: number): number {
  if (typeof port === 'number' && Number.isInteger(port) && port > 0) {
    return port;
  }

  const envPort = Number.parseInt(process.env.PORT || '', 10);
  return Number.isInteger(envPort) && envPort > 0 ? envPort : DEFAULT_PORT;
}

function listen(port: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.once('error', reject);
  });
}

async function cleanupServerState(): Promise<void> {
  const server = httpServer;

  httpServer = null;
  activePort = null;

  shutdownAnalyticsService();
  stopSecurityWatcher();
  closeWebSocket();
  clearDesktopBridge();
  closeDatabase();

  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export async function stop(options: { exitProcess?: boolean } = {}): Promise<void> {
  if (!httpServer) {
    if (options.exitProcess) {
      process.exit(0);
    }
    return;
  }

  console.log('\nShutting down...');

  try {
    await cleanupServerState();
    console.log('Server stopped');

    if (options.exitProcess) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Failed to stop server cleanly:', error);
    if (options.exitProcess) {
      process.exit(1);
    }
    throw error;
  }
}

function registerSignalHandlers(): void {
  if (signalHandlersRegistered) {
    return;
  }

  const handleSignal = () => {
    void stop({ exitProcess: true });
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);
  signalHandlersRegistered = true;
}

const isMainModule = (() => {
  if (!process.argv[1]) return false;

  try {
    const scriptPath = realpathSync(process.argv[1]);
    const modulePath = realpathSync(fileURLToPath(import.meta.url));
    return scriptPath === modulePath;
  } catch {
    return false;
  }
})();

export async function start(options: StartServerOptions = {}): Promise<StartedServer> {
  const port = resolvePort(options.port);

  if (httpServer) {
    return {
      port: activePort ?? port,
      server: httpServer,
    };
  }

  try {
    ensureConfigDir();

    getDatabase();
    console.log('Database initialized');

    const config = loadConfig();

    await initPricingService(config.pricingEndpoint);

    initializeAnalyticsService(config.openClawPath);

    if (config.securityAlertsEnabled) {
      startSecurityWatcher({
        openClawPath: config.openClawPath,
        gatewayLogsPath: config.gatewayLogsPath,
        enabled: config.securityAlertsEnabled,
      });
      console.log('Security watcher started');
    }

    const server = await listen(port);
    httpServer = server;
    activePort = port;

    initWebSocket(server);
    registerSignalHandlers();

    console.log(`\nClawalytics server running at http://localhost:${port}`);
    console.log(`Dashboard: http://localhost:${port}`);
    console.log(`API: http://localhost:${port}/api`);
    console.log('\nPress Ctrl+C to stop\n');

    return { port, server };
  } catch (error) {
    try {
      await cleanupServerState();
    } catch (cleanupError) {
      console.error('Failed to clean up after startup error:', cleanupError);
    }

    console.error('Failed to start server:', error);

    if (isMainModule) {
      process.exit(1);
    }

    throw error;
  }
}

if (isMainModule) {
  void start();
}

export { app };
export { setDesktopBridge };
export { broadcastDesktopCloseRequested as requestDesktopCloseChoice };
