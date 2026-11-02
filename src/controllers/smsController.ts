import { Request, Response } from 'express';
import AfricasTalking from 'africastalking';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

// Initialize Africa's Talking SDK
const africasTalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY || 'your_api_key',
  username: process.env.AT_USERNAME || 'sandbox',
});

const sms = africasTalking.SMS;

// Helper to clean numerical answers
const normalizeAmount = (a: string): string => a.replace(/[^0-9]/g, '');

/**
 * Handles Incoming SMS Webhooks from Africa's Talking
 * Expects body parameters: sessionId, phoneNumber, text, date, id
 */
export const handleSMS = async (req: Request, res: Response): Promise<void> => {
    // Debug log the full body to inspect incoming payload keys
  logger.info('Raw SMS webhook body received:', req.body);

  const sessionId = req.body.sessionId || req.body.id;
  // Fallback across all possible variations of phone/from keys
  const phoneNumber = req.body.phoneNumber || req.body.from || req.body.sender;
  const text = req.body.text || req.body.message;

  if (!phoneNumber) {
    res.status(400).send('Bad Request: Missing phone number or sender');
    return;
  }
  try {
    // 1. Ensure user exists in database (Auto-registration)
    let userResult = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    let userId: string;

    if (userResult.rows.length === 0) {
      const newUserResult = await pool.query(
        'INSERT INTO users (phone_number) VALUES ($1) RETURNING id',
        [phoneNumber]
      );
      userId = newUserResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // 2. Fetch user's current progress count
    const progressResult = await pool.query(
      'SELECT COUNT(DISTINCT lesson_id) AS completed FROM user_progress WHERE user_id = $1',
      [userId]
    );
    const completedCount = Number(progressResult.rows[0]?.completed || 0);

    const messageBody = text ? text.trim() : '';
    let replyMessage = '';

    // 3. Handle Keyword Commands or General Navigation
    if (messageBody === '' || messageBody.toUpperCase() === 'BOOK' || messageBody.toUpperCase() === 'MENU') {
      replyMessage = 
        `Welcome to Basic Bookkeeping via SMS!\n` +
        `You have completed ${completedCount} out of 15 lessons.\n\n` +
        `Reply with:\n` +
        `START - To receive your next lesson\n` +
        `PROGRESS - To check your score\n` +
        `HELP - For instructions`;
    } 
    else if (messageBody.toUpperCase() === 'PROGRESS') {
      replyMessage = `Your phone number (${phoneNumber}) has completed ${completedCount} out of 15 lessons. Keep learning!`;
    } 
    else if (messageBody.toUpperCase() === 'HELP') {
      replyMessage = 
        `Basic Bookkeeping Help:\n` +
        `- Text START to get your next lesson.\n` +
        `- Answer practice questions directly with numbers or short words.\n` +
        `- All financial examples use Nigerian Naira (₦).`;
    } 
    else if (messageBody.toUpperCase() === 'START') {
      const currentLessonId = completedCount + 1;
      if (currentLessonId > 15) {
        replyMessage = `CONGRATULATIONS! You have completed all 15 lessons of the Basic Bookkeeping Course!`;
      } else {
        replyMessage = getLessonPrompt(currentLessonId);
      }
    }
    else {
      // User is submitting an answer to their current active lesson
      const currentLessonId = completedCount + 1;

      if (currentLessonId > 15) {
        replyMessage = `You have already completed the course! Text PROGRESS to view your status.`;
      } else {
        const isCorrect = evaluateAnswerForLesson(currentLessonId, messageBody);

        if (isCorrect) {
          await pool.query(
            `INSERT INTO user_progress (user_id, lesson_id, status)
             VALUES ($1, $2, 'completed')
             ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed'`,
            [userId, currentLessonId]
          );

          const nextLessonNum = currentLessonId + 1;
          replyMessage = 
            `Correct! Well done. Progress saved for Lesson ${currentLessonId}.\n\n` +
            (nextLessonNum <= 15 
              ? `Text START to receive Lesson ${nextLessonNum}.` 
              : `You have completed the entire course!`);
        } else {
          replyMessage = `Not quite right for Lesson ${currentLessonId}. Review the question and try again, or text HELP for guidance.`;
        }
      }
    }

    // 4. Send SMS back to user via Africa's Talking SDK
    await sms.send({
      to: [phoneNumber],
      message: replyMessage,
    });

    res.status(200).send('SMS Processed Successfully');
  } catch (error: any) {
    logger.error('Error processing incoming SMS', {
      message: error?.message,
      stack: error?.stack,
      sessionId,
      phoneNumber,
    });
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Lesson Prompt Text Definitions
 */
const getLessonPrompt = (lessonId: number): string => {
  const prompts: Record<number, string> = {
    1: 'LESSON 1.1: What is bookkeeping?\nReceive ₦5,000 from sales, spend ₦1,500 on transport. How much remains?\nReply with the amount only.',
    2: 'LESSON 1.2: Recording transactions.\nYou spend ₦500 on transport today. Which THREE details should you record?\nReply with the three details.',
    3: 'LESSON 1.3: Cashbook balance.\nStart with ₦3,000, receive ₦2,500, spend ₦1,000. Closing cash balance?\nReply with amount.',
    4: 'LESSON 2.1: Sales revenue.\nSell 5 notebooks for ₦800 each. Total sales revenue?\nReply with amount.',
    5: 'LESSON 2.2: Business costs.\nEarn ₦6,000 sales. Goods cost ₦3,500, packaging costs ₦500. Total cost & expenses?\nReply with amount.',
    6: 'LESSON 2.3: Profit and loss.\nSales ₦10,000, goods cost ₦6,000, expenses ₦1,500. Net profit?\nReply with amount.',
    7: 'LESSON 3.1: Daily transactions.\nStart ₦5,000, spend ₦2,000 stock, receive ₦3,500 cash sales. Closing cash?\nReply with amount.',
    8: 'LESSON 3.2: Checking cash balance.\nOpening cash ₦6,000, received ₦4,000, spent ₦2,500. Closing cash balance?\nReply with amount.',
    9: 'LESSON 3.3: Case studies.\nStart ₦8,000, buy goods ₦3,000, sell all for ₦5,000. Closing cash?\nReply with amount.',
    10: 'LESSON 4.1: Managing stock.\nBuy 30 notebooks, sell 12. How many remain?\nReply with number.',
    11: 'LESSON 4.2: Stock purchases/sales.\nBuy 15 pairs of slippers, sell 6 pairs. How many remain?\nReply with number.',
    12: 'LESSON 4.3: Customer credit.\nSell goods worth ₦3,000 to Tunde on credit. How much does Tunde owe?\nReply with amount.',
    13: 'LESSON 5.1: Organising records.\nBuy goods for ₦5,000. Which document should you keep as proof?\nReply with answer.',
    14: 'LESSON 5.2: Business summary.\nSales ₦15,000, goods cost ₦9,000, expenses ₦2,000. Net profit?\nReply with amount.',
    15: 'LESSON 5.3: Business decisions.\nSell 20 water bottles and 3 juice bottles. Which product sold more?\nReply with answer.'
  };
  return prompts[lessonId] || 'LESSON: Review your materials and text START.';
};

/**
 * Answer validation logic matching the 15 lessons
 */
const evaluateLessonAnswers: Record<number, (ans: string) => boolean> = {
  1: (a) => normalizeAmount(a) === '3500',
  2: (a) => { const s = a.toLowerCase(); return s.includes('date') && s.includes('description') && s.includes('amount'); },
  3: (a) => normalizeAmount(a) === '4500',
  4: (a) => normalizeAmount(a) === '4000',
  5: (a) => normalizeAmount(a) === '4000',
  6: (a) => normalizeAmount(a) === '2500',
  7: (a) => normalizeAmount(a) === '6500',
  8: (a) => normalizeAmount(a) === '7500',
  9: (a) => normalizeAmount(a) === '10000',
  10: (a) => normalizeAmount(a) === '18',
  11: (a) => normalizeAmount(a) === '9',
  12: (a) => normalizeAmount(a) === '3000',
  13: (a) => a.toLowerCase().includes('receipt'),
  14: (a) => normalizeAmount(a) === '4000',
  15: (a) => a.toLowerCase().includes('water'),
};

const evaluateAnswerForLesson = (lessonId: number, answer: string): boolean => {
  const validator = evaluateLessonAnswers[lessonId];
  if (!validator) return false;
  return validator(answer);
};
