import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.ts';
import { logger } from '../utils/logger.ts';

export const handleUSSD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  logger.info('Incoming USSD request', { sessionId, phoneNumber, text });

  try {
    const textArray = text === '' ? [] : text.split('*');
    const currentLevel = textArray.length;
    let response = '';

    switch (currentLevel) {
      case 0:
        response = `CON Welcome to TekNexus Mobile Learning\n`;
        response += `1. Select Course\n`;
        response += `2. Check Progress`;
        break;

      case 1:
        if (textArray[0] === '1') {
          // Fetch active courses from DB efficiently
          const client = await pool.connect();
          try {
            const result = await client.query('SELECT id, title FROM courses WHERE active = TRUE LIMIT 3');
            if (result.rows.length === 0) {
              response = `END No courses available at the moment.`;
            } else {
              response = `CON Choose a Vocational Course:\n`;
              result.rows.forEach((course, index) => {
                response += `${index + 1}. ${course.title}\n`;
              });
            }
          } finally {
            client.release();
          }
        } else if (textArray[0] === '2') {
          response = `END Your phone number (${phoneNumber}) has completed 0 courses. Keep learning!`;
        } else {
          response = `CON Invalid option. Choose:\n1. Select Course\n2. Check Progress`;
        }
        break;

      default:
        response = `END Session completed or invalid input path.`;
        break;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(response);
  } catch (error) {
    logger.error('Error processing USSD request', { error, sessionId, phoneNumber });
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`END An unexpected error occurred. Please try again later.`);
  }
};
