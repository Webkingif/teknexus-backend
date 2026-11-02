import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { handleUSSD } from './controllers/ussdController.js';
import { logger } from './utils/logger.js';
const app = express();
// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// USSD Webhook Route
app.post('/ussd', handleUSSD);
// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Unhandled application error', { message: err.message, stack: err.stack });
    res.status(500).setHeader('Content-Type', 'text/plain');
    res.send('END An internal server error occurred.');
});
export default app;
