import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { handleUSSD } from './controllers/ussdController.ts';
import { logger } from './utils/logger.ts';

const app: Application> = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.post('/ussd', handleUSSD);

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled application error', { message: err.message, stack: err.stack });
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

export default app;
