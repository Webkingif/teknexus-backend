import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { handleUSSD } from './controllers/ussdController.js';
import { logger } from './utils/logger.js';
import smsRoutes from './routes/smsRoutes.js';

const app: Application = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
// CHANGED: extended: true ensures form-urlencoded SMS webhooks parse correctly
app.use(bodyParser.urlencoded({ extended: true })); 

// USSD Webhook Route
app.post('/ussd', handleUSSD);

// SMS Webhook Routes
app.use('/sms', smsRoutes);

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled application error', { message: err.message, stack: err.stack });
  res.status(500).setHeader('Content-Type', 'text/plain');
  res.send('END An internal server error occurred.');
});

export default app;
