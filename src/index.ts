import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { loadEnv } from './config/env.js';
import { requestIdPlugin } from './middleware/request-id.js';
import { errorHandlerPlugin } from './middleware/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { trackRoutes } from './modules/tracks/tracks.routes.js';
import { storyRoutes } from './modules/stories/stories.routes.js';
import { distributionRoutes } from './modules/distribution/distribution.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { notificationRoutes } from './modules/notifications/notifications.routes.js';
import { getLogger } from './utils/logger.js';
import { initDb, closePool } from './db/connection.js';
import { stopWebhookProcessor } from './modules/webhooks/webhooks.service.js';

async function start() {
  const env = loadEnv();
  const logger = getLogger();

  // Initialize database connection
  initDb();

  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    genReqId: () => crypto.randomUUID(),
  });

  // Core plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(helmet);
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });

  // Custom plugins
  await fastify.register(requestIdPlugin);
  await fastify.register(errorHandlerPlugin);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Route modules
  await fastify.register(authRoutes);
  await fastify.register(trackRoutes);
  await fastify.register(storyRoutes);
  await fastify.register(distributionRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(dashboardRoutes);
  await fastify.register(notificationRoutes);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down...');
    stopWebhookProcessor();
    await fastify.close();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Start
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
