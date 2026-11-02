import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const handleUSSD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  logger.info('Incoming USSD request', { sessionId, phoneNumber, text });

  try {
    // 1. Auto-Register User
    let userResult = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
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

    const textArray = text === '' ? [] : text.split('*');
    const currentLevel = textArray.length;
    let response = '';

    switch (currentLevel) {
      case 0:
        // Main Menu (5 Modules + Progress)[span_1](start_span)[span_1](end_span)
        response = `CON Welcome to Basic Bookkeeping.\n`;
        response += `Choose the module you want to study:\n`;
        response += `1. Recording Money In and Money Out\n`;
        response += `2. Understanding Sales, Costs & Profit\n`;
        response += `3. Practical Bookkeeping\n`;
        response += `4. Managing Stock and Credit\n`;
        response += `5. Reviewing Business Records\n`;
        response += `6. My Progress`;
        break;

      case 1:
        const selectedOption = textArray[0];
        if (['1', '2', '3', '4', '5'].includes(selectedOption)) {
          // Module Menu Selection (Showing 3 Lessons per module)
          const moduleNames = [
            'Recording Money In and Out',
            'Sales, Costs and Profit',
            'Practical Bookkeeping',
            'Stock and Credit',
            'Reviewing Business Records'
          ];
          response = `CON MODULE ${selectedOption}: ${moduleNames[Number(selectedOption) - 1]}\n`;
          response += `Choose a Lesson:\n`;
          response += `1. Lesson 1\n`;
          response += `2. Lesson 2\n`;
          response += `3. Lesson 3\n`;
          response += `0. Back`;
        } else if (selectedOption === '6') {
          // Fetch total completed lessons across all modules
          const progressResult = await pool.query(
            'SELECT COUNT(DISTINCT lesson_id) as completed FROM user_progress WHERE user_id = $1',
            [userId]
          );
          const completedCount = progressResult.rows[0]?.completed || 0;
          response = `END Your phone number (${phoneNumber}) has completed ${completedCount} out of 15 lessons. Keep learning!`;
        } else {
          response = `CON Invalid option. Reply with 1–6.`;
        }
        break;

      case 2:
        // Lesson Content Presentation based on Module (textArray[0]) and Lesson (textArray[1])
        const mod = textArray[0];
        const les = textArray[1];

        if (les === '0') {
          response = `CON Welcome to Basic Bookkeeping.\nChoose module (1-5) or 6 for Progress:`;
          break;
        }

        if (mod === '1') {
          if (les === '1') {
            response = `CON LESSON 1.1: What is bookkeeping?\nKeeping clear records of all money received and spent. Sales bring money in, expenses take money out.\n1. Next\n0. Back`;
          } else if (les === '2') {
            response = `CON LESSON 1.2: Recording transactions.\nA good record needs THREE details: Date, Description, and Amount.\n1. Next\n0. Back`;
          } else if (les === '3') {
            response = `CON LESSON 1.3: Cashbook & Balance.\nClosing cash = Opening cash + Money IN - Money OUT.\n1. Next\n0. Back`;
          }
        } else if (mod === '2') {
          if (les === '1') {
            response = `CON LESSON 2.1: Sales & Revenue.\nRevenue = Quantity sold x Selling price per item.\n1. Next\n0. Back`;
          } else if (les === '2') {
            response = `CON LESSON 2.2: Business Costs.\nIncludes cost of goods sold, transport, rent, packaging.\n1. Next\n0. Back`;
          } else if (les === '3') {
            response = `CON LESSON 2.3: Profit and Loss.\nGross profit = Sales - Cost of Goods. Net Profit = Gross Profit - Expenses.\n1. Next\n0. Back`;
          }
        } else if (mod === '3') {
          if (les === '1') {
            response = `CON LESSON 3.1: Daily Transactions.\nRecord every transaction. Opening cash - purchases + sales = closing cash.\n1. Next\n0. Back`;
          } else if (les === '2') {
            response = `CON LESSON 3.2: Checking Cash Balance.\nCompare calculated closing cash with physical count. Never fake records.\n1. Next\n0. Back`;
          } else if (les === '3') {
            response = `CON LESSON 3.3: Case Studies.\nClosing cash and profit are different! Profit measures earnings after costs.\n1. Next\n0. Back`;
          }
        } else if (mod === '4') {
          if (les === '1') {
            response = `CON LESSON 4.1: Managing Stock.\nStock = goods kept to sell. Remaining = Bought - Sold.\n1. Next\n0. Back`;
          } else if (les === '2') {
            response = `CON LESSON 4.2: Stock Purchases & Sales.\nRecord quantities, purchase totals, and sales revenue separately.\n1. Next\n0. Back`;
          } else if (les === '3') {
            response = `CON LESSON 4.3: Customer & Supplier Credit.\nCredit means buying/selling now and paying later. Track debts.\n1. Next\n0. Back`;
          }
        } else if (mod === '5') {
          if (les === '1') {
            response = `CON LESSON 5.1: Organising Records.\nKeep receipts, invoices, and separate business from personal money.\n1. Next\n0. Back`;
          } else if (les === '2') {
            response = `CON LESSON 5.2: Business Summary.\nWeekly summary tracks total sales, costs, and net profit.\n1. Next\n0. Back`;
          } else if (les === '3') {
            response = `CON LESSON 5.3: Business Decisions.\nUse records to see fast-moving products and trim high expenses.\n1. Next\n0. Back`;
          }
        } else {
          response = `CON Invalid module selection.`;
        }
        break;

      case 3:
      case 4:
      case 5:
        // Multi-page lesson navigation buffer (allows clicking 'Next' through lesson slides)
        response = `CON Continue reading lesson...\n1. Next\n0. Back`;
        break;

      case 6:
        // Trigger Practice Test Prompt based on active module and lesson
        const m = textArray[0];
        const l = textArray[1];
        if (m === '1' && l === '1') {
          response = `CON TEST YOURSELF:\nReceive ₦5,000 from sales, spend ₦1,500 on transport. How much remains?\nReply amount only:`;
        } else if (m === '1' && l === '2') {
          response = `CON TEST YOURSELF:\nSpend ₦500 on transport today. Which THREE details should you record?\nReply with details:`;
        } else if (m === '1' && l === '3') {
          response = `CON TEST YOURSELF:\nStart with ₦3,000, receive ₦2,500, spend ₦1,000. Closing cash balance?\nReply amount:`;
        } else if (m === '2' && l === '1') {
          response = `CON TEST YOURSELF:\nSell 5 notebooks for ₦800 each. Total sales revenue?\nReply amount:`;
        } else if (m === '2' && l === '2') {
          response = `CON TEST YOURSELF:\nEarn ₦6,000 sales. Goods cost ₦3,500, packaging costs ₦500. Total cost & expenses?\nReply amount:`;
        } else if (m === '2' && l === '3') {
          response = `CON TEST YOURSELF:\nSales ₦10,000, goods cost ₦6,000, expenses ₦1,500. Net profit?\nReply amount:`;
        } else if (m === '3' && l === '1') {
          response = `CON TEST YOURSELF:\nStart ₦5,000, spend ₦2,000 stock, receive ₦3,500 cash sales. Closing cash?\nReply amount:`;
        } else if (m === '3' && l === '2') {
          response = `CON TEST YOURSELF:\nOpening cash ₦6,000, received ₦4,000, spent ₦2,500. Closing cash balance?\nReply amount:`;
        } else if (m === '3' && l === '3') {
          response = `CON TEST YOURSELF:\nStart ₦8,000, buy goods ₦3,000, sell all for ₦5,000. Closing cash?\nReply amount:`;
        } else if (m === '4' && l === '1') {
          response = `CON TEST YOURSELF:\nBuy 30 notebooks, sell 12. How many remain?\nReply number:`;
        } else if (m === '4' && l === '2') {
          response = `CON TEST YOURSELF:\nBuy 15 pairs of slippers, sell 6 pairs. How many remain?\nReply number:`;
        } else if (m === '4' && l === '3') {
          response = `CON TEST YOURSELF:\nSell goods worth ₦3,000 to Tunde on credit. How much does Tunde owe?\nReply amount:`;
        } else if (m === '5' && l === '1') {
          response = `CON TEST YOURSELF:\nBuy goods for ₦5,000. Which document should you keep as proof?\nReply answer:`;
        } else if (m === '5' && l === '2') {
          response = `CON TEST YOURSELF:\nSales ₦15,000, goods cost ₦9,000, expenses ₦2,000. Net profit?\nReply amount:`;
        } else if (m === '5' && l === '3') {
          response = `CON TEST YOURSELF:\nSell 20 water bottles and 3 juice bottles. Which product sold more?\nReply answer:`;
        } else {
          response = `CON Continue to quiz answer:`;
        }
        break;

      case 7:
        // Evaluate Quiz Answer and Save Progress
        const modNum = Number(textArray[0]);
        const lesNum = Number(textArray[1]);
        const userAnswer = textArray[6].trim().toLowerCase();

        // Calculate unique lesson ID offset based on module & lesson
        // (Module 1: lessons 1-3, Module 2: lessons 4-6, etc.)
        const calculatedLessonId = ((modNum - 1) * 3) + lesNum;
        let isCorrect = false;

        // Validation logic per lesson
        if (modNum === 1 && lesNum === 1 && userAnswer === '3500') isCorrect = true;
        else if (modNum === 1 && lesNum === 2 && userAnswer.includes('date') && userAnswer.includes('description') && userAnswer.includes('amount')) isCorrect = true;
        else if (modNum === 1 && lesNum === 3 && userAnswer === '4500') isCorrect = true;
        else if (modNum === 2 && lesNum === 1 && userAnswer === '4000') isCorrect = true;
        else if (modNum === 2 && lesNum === 2 && userAnswer === '4000') isCorrect = true;
        else if (modNum === 2 && lesNum === 3 && userAnswer === '2500') isCorrect = true;
        else if (modNum === 3 && lesNum === 1 && userAnswer === '6500') isCorrect = true;
        else if (modNum === 3 && lesNum === 2 && userAnswer === '7500') isCorrect = true;
        else if (modNum === 3 && lesNum === 3 && userAnswer === '10000') isCorrect = true;
        else if (modNum === 4 && lesNum === 1 && userAnswer === '18') isCorrect = true;
        else if (modNum === 4 && lesNum === 2 && userAnswer === '9') isCorrect = true;
        else if (modNum === 4 && lesNum === 3 && userAnswer === '3000') isCorrect = true;
        else if (modNum === 5 && lesNum === 1 && userAnswer.includes('receipt')) isCorrect = true;
        else if (modNum === 5 && lesNum === 2 && userAnswer === '4000') isCorrect = true;
        else if (modNum === 5 && lesNum === 3 && userAnswer.includes('water')) isCorrect = true;

        if (isCorrect) {
          // Save completion to database
          await pool.query(
            `INSERT INTO user_progress (user_id, lesson_id, status) 
             VALUES ($1, $2, 'completed') 
             ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed'`,
            [userId, calculatedLessonId]
          ).catch(err => logger.error('Failed to save progress', err));

          response = `END Correct! Well done. Progress saved for Module ${modNum}, Lesson ${lesNum}.`;
        } else {
          response = `CON Not quite right. Please review the lesson and try again.`;
        }
        break;

      default:
        response = `END Session completed or invalid input path.`;
        break;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(response);
  } catch (error: any) {
    logger.error('Error processing USSD request', { 
      message: error?.message, 
      stack: error?.stack, 
      sessionId, 
      phoneNumber 
    });
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`END An unexpected error occurred. Please try again later.`);
  }
};
