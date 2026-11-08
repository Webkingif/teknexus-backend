import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleUSSD } from './controllers/ussdController.js';
import { logger } from './utils/logger.js';
import smsRoutes from './routes/smsRoutes.js';

const app: Application = express();

// Recreate __dirname for ES modules compatibility on Node.js / Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define potential paths for public directory (Vercel serverless vs local dev)
const publicPaths = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, './public'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), 'dist/public')
];

// Locate the valid public path dynamically
const publicPath = publicPaths.find(p => fs.existsSync(p)) || publicPaths[0];

// Security & Middleware
// Configure Helmet so it doesn't block loading UI assets in the browser
app.use((helmet as any)({ contentSecurityPolicy: false }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Serve static files 
app.use(express.static(publicPath));

// Serve phone.html at /phone
app.get('/phone', (req: Request, res: Response) => {
  const filePath = path.join(publicPath, 'phone.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Ultimate fallback searching current working directory on Vercel
    const rootPhonePath = path.resolve(process.cwd(), 'public/phone.html');
    if (fs.existsSync(rootPhonePath)) {
      res.sendFile(rootPhonePath);
    } else {
      res.status(404).send('❌ phone.html not found on server context.');
    }
  }
});

// USSD Webhook Route
app.post('/ussd', handleUSSD);

// SMS Webhook Routes
app.use('/sms', smsRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled application error', { message: err.message, stack: err.stack });
  res.status(500).setHeader('Content-Type', 'text/plain');
  res.send('END An internal server error occurred.');
});

export default app;
