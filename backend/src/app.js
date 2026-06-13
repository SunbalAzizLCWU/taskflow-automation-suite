import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import logRoutes from './routes/logRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { authLimiter, webhookLimiter, apiLimiter } from './middleware/rateLimit.js';

// Builds the Express app. Kept separate from server.js so it can be imported
// in tests without binding a port.
export function createApp() {
  const app = express();

  // Trust the proxy (Render/Fly sit behind one) so rate limiting and secure
  // cookies see the real client IP.
  app.set('trust proxy', 1);

  // Security headers (HSTS, X-Content-Type-Options, etc.).
  app.use(helmet());

  const origins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // In production, refuse to silently allow all origins: that is a real CORS risk.
  if (process.env.NODE_ENV === 'production' && origins.length === 0) {
    console.warn('[security] CLIENT_ORIGIN is not set in production; CORS will block browser clients until you set it.');
  }
  app.use(cors({ origin: origins.length ? origins : true }));

  // Cap request body size to protect the public webhook endpoint from huge payloads.
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/tasks', apiLimiter, taskRoutes);
  app.use('/api/rules', apiLimiter, ruleRoutes);
  app.use('/api/logs', apiLimiter, logRoutes);
  app.use('/api/ai', apiLimiter, aiRoutes);
  // Public inbound webhooks (no JWT; secured by token in the URL + rate limited).
  app.use('/api/hooks', webhookLimiter, webhookRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
