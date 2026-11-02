import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const handleUSSD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  logger.info('Incoming USSD request', { sessionId, phoneNumber, text });

  try {
    const textArray = text === '' ? [] : text.split('*');
    const currentLevel = textArray.length;
    let response = '';

    switch (currentLevel) {
      case 0:
        // Main Menu
        response = `CON Welcome to TekNexus Mobile Learning[span_0](start_span)[span_0](end_span)\n`;
        response += `1. Bookkeeping Course\n`;
        response += `2. My Progress`;
        break;

      case 1:
        if (textArray[0] === '1') {
          // Choose between Lesson 1 and Lesson 2
          response = `CON Choose a Lesson:\n`;
          response += `1. Lesson 1: What is bookkeeping?\n`;
          response += `2. Lesson 2: Recording transactions\n`;
          response += `0. Back`;
        } else if (textArray[0] === '2') {
          response = `END Your phone number (${phoneNumber}) has completed 0 out of 2 lessons. Keep learning[span_1](start_span)[span_1](end_span)!`;
        } else {
          response = `CON Invalid option. Choose:\n1. Bookkeeping Course\n2. My Progress`;
        }
        break;

      case 2:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Lesson 1, Page 1 (SMS 1)
            response = `CON LESSON 1: What is bookkeeping?\n`;
            response += `Keeping clear records of all money received and spent by a person or business.\n`;
            response += `1. Next\n0. Back`;
          } else if (textArray[1] === '2') {
            // Lesson 2, Page 1 (SMS 1)
            response = `CON LESSON 2: Recording transactions.\n`;
            response += `Every time money enters or leaves, record what happened.\n`;
            response += `1. Next\n0. Back`;
          } else if (textArray[1] === '0') {
            response = `CON Welcome to TekNexus Mobile Learning[span_2](start_span)[span_2](end_span)\n1. Bookkeeping Course\n2. My Progress`;
          } else {
            response = `CON Invalid choice. Choose:\n1. Lesson 1\n2. Lesson 2\n0. Back`;
          }
        }
        break;

      case 3:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Lesson 1, Page 2 (SMS 2)
            response = `CON Bookkeeping helps you know money in, money out, and what remains.\n1. Next`;
          } else if (textArray[1] === '2') {
            // Lesson 2, Page 2 (SMS 2)
            response = `CON A good transaction record needs three details:\n1. Date\n2. Description\n3. Amount\n1. Next`;
          }
        }
        break;

      case 4:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Lesson 1, Page 3 (SMS 3 & 4)
            response = `CON MONEY IN: sales & customer payments.\n`;
            response += `MONEY OUT: goods, transport, rent, electricity.\n1. Next`;
          } else if (textArray[1] === '2') {
            // Lesson 2, Page 3 (SMS 3 & 4)
            response = `CON DATE: Day it happened.\n`;
            response += `DESCRIPTION: What happened (e.g., Sold snacks).\n1. Next`;
          }
        }
        break;

      case 5:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Lesson 1, Page 4 (SMS 5 & 6)
            response = `CON Example: Ada sells snacks for N5,000 (IN). Spends N1,500 on packaging (OUT).\n`;
            response += `1. Take Practice Test`;
          } else if (textArray[1] === '2') {
            // Lesson 2, Page 4 (SMS 5 & 6)
            response = `CON AMOUNT: Money received/spent. Ex: 30 Oct, Sold snacks, N2000 received.\n`;
            response += `1. Take Practice Test`;
          }
        }
        break;

      case 6:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Lesson 1 Practice Question (SMS 7)
            response = `CON TEST YOURSELF:\n`;
            response += `Receive N5,000 from sales, spend N1,500 on transport. How much remains?\n`;
            response += `Reply with amount only:`;
          } else if (textArray[1] === '2') {
            // Lesson 2 Practice Question (SMS 7)
            response = `CON TEST YOURSELF:\n`;
            response += `Spend N500 on transport today. Which THREE details should you record?\n`;
            response += `Reply (e.g., Date, description, amount):`;
          }
        }
        break;

      case 7:
        if (textArray[0] === '1') {
          if (textArray[1] === '1') {
            // Evaluating Lesson 1 Answer
            const userAnswer = textArray[6].trim();
            const expectedAnswer = '3500';

            if (userAnswer === expectedAnswer) {
              response = `END Correct! Well done.\nN5,000 - N1,500 = N3,500.\nYou understand money in and out!`;
            } else {
              response = `CON Not quite. Money received is added, spent is deducted.\n`;
              response += `N5,000 - N1,500 = N3,500. Try again:`;
            }
          } else if (textArray[1] === '2') {
            // Evaluating Lesson 2 Answer
            const userAnswer = textArray[6].toLowerCase();
            const hasDate = userAnswer.includes('date');
            const hasDesc = userAnswer.includes('description') || userAnswer.includes('desc');
            const hasAmount = userAnswer.includes('amount');

            if (hasDate && hasDesc && hasAmount) {
              response = `END Excellent!\nYou need: Date, Description, and Amount.\nYou have completed Lesson 2!`;
            } else {
              response = `CON Incomplete. Remember you need THREE details (Date, Description, Amount).\nTry again:`;
            }
          }
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
  
