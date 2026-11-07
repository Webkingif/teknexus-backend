import http from 'http';
import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

// Create HTTP server instance using the Express application
const server = http.createServer(app);

// Start listening for incoming webhook traffic
server.listen(PORT, () => {
  logger.info(`TekNexus production backend successfully started and listening on port ${PORT}`);
});

/**
 * Graceful Shutdown Handler
 * Ensures active HTTP connections are finished safely before the process terminates,
 * preventing data loss or dropped webhook requests during deployments or scaling events.
 */
const gracefulShutdown = (signal:string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown of HTTP server...`);
  
  server.close(() => {
    logger.info('HTTP server successfully closed. All active connections completed.');
    process.exit(0);
  });

  // Force shutdown safeguard if connections hang for more than 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown: Could not close all connections in time.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals from process managers (like Docker, Kubernetes, or PM2)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled asynchronous rejections globally to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', { error: error.message, stack: error.stack });
  process.exit(1);
});
