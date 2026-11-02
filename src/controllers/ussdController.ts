import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

// ============================================================
// CONTENT DEFINITIONS (from BASIC BOOKKEEPING THROUGH SMS.docx)
// Each lesson = 6-14 teaching SMS + 1 practice question
// ============================================================

interface LessonContent {
  moduleNumber: number;
  lessonNumber: number;
  title: string;
  smsMessages: string[];
  question: string;
  validateAnswer: (answer: string) => boolean;
  correctFeedback: string;
  incorrectFeedback: string;
}

const normalizeAmount = (a: string): string => a.replace(/[^0-9]/g, '');

const LESSONS: Record<string, LessonContent> = {
  // ---------- MODULE 1 ----------
  '1-1': {
    moduleNumber: 1,
    lessonNumber: 1,
    title: 'Understanding Money In and Money Out',
    smsMessages: [
      'LESSON 1: What is bookkeeping?\nBookkeeping means keeping clear records of all money received and money spent by a person or business.',
      'Bookkeeping helps you know how much money comes in, how much goes out and how much remains.',
      'MONEY IN means money received by your business.\nExamples: money from sales, customer payments and business services.',
      'MONEY OUT means money paid by your business.\nExamples: buying goods, transport, packaging, electricity and rent.',
      'Example: Ada sells snacks for ₦5,000. She receives ₦5,000. This is MONEY IN.',
      'Ada also spends ₦1,500 buying packaging materials. This is MONEY OUT.\nRemember: Sales bring money in. Business payments take money out.',
    ],
    question: 'TEST YOURSELF!\nYou receive ₦5,000 from sales and spend ₦1,500 on transport.\nHow much money remains?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '3500',
    correctFeedback: 'Correct! Well done.\n₦5,000 - ₦1,500 = ₦3,500\nYou understand money in and money out.',
    incorrectFeedback: 'Not quite. Remember:\nMoney received is added. Money spent is deducted.\n₦5,000 - ₦1,500 = ₦3,500\nThe correct answer is ₦3,500.',
  },
  '1-2': {
    moduleNumber: 1,
    lessonNumber: 2,
    title: 'Recording Dates and Descriptions',
    smsMessages: [
      'LESSON 2: Recording transactions.\nEvery time money enters or leaves your business, you should record what happened.',
      'A good transaction record needs three important details:\nDate\nDescription\nAmount',
      'DATE means the day the transaction happened.\nExample: 30 October 2026.\nAlways use the correct transaction date.',
      'DESCRIPTION means a short explanation of what happened.\nExamples: Sold snacks, bought rice or paid transport.',
      'AMOUNT means how much money was received or spent.\nExample: 2,000 received from snack sales.',
      'Example of a complete record:\nDate: 30 October 2026\nDescription: Sold snacks\nAmount: 2,000 received.\nThis makes your records easy to understand.',
    ],
    question: 'TEST YOURSELF!\nYou spend ₦500 on transport today.\nWhich THREE details should you record?\nReply with the three details.',
    validateAnswer: (a) => {
      const s = a.toLowerCase();
      return s.includes('date') && s.includes('description') && s.includes('amount');
    },
    correctFeedback: 'Excellent!\nYou need:\nDate: Today\nDescription: Transport\nAmount: ₦500 spent.\nYou have completed Lesson 2.',
    incorrectFeedback: 'Almost there!\nRemember the three details:\nDate: When it happened.\nDescription: What happened.\nAmount: How much money.\nTry again. Reply with all three.',
  },
  '1-3': {
    moduleNumber: 1,
    lessonNumber: 3,
    title: 'Keeping a Simple Cashbook',
    smsMessages: [
      'LESSON 3: What is a cashbook?\nA cashbook is a record of money received and money paid out by a business.',
      'A simple cashbook records:\nDate\nDescription\nMoney IN\nMoney OUT\nBalance',
      'OPENING BALANCE means the money available at the beginning of a day or period.\nExample: You start your business day with ₦4,000.',
      'CLOSING BALANCE means the cash remaining after adding money received and deducting money spent.',
      'Remember this formula:\nClosing cash = Opening cash + Money IN - Money OUT.',
      'Example:\nOpening cash: ₦4,000\nSales received: ₦2,000\nTransport paid: ₦500\nClosing cash = ₦5,500.',
      'A cashbook helps you check whether the money you have agrees with your records.\nRecord transactions as they happen, not only at the end of the month.',
    ],
    question: 'TEST YOURSELF!\nYou start with ₦3,000.\nYou receive ₦2,500 from sales and spend ₦1,000.\nWhat is your closing cash balance?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '4500',
    correctFeedback: 'Correct!\n₦3,000 + ₦2,500 - ₦1,000 = ₦4,500.',
    incorrectFeedback: 'Not quite.\nStart with ₦3,000.\nAdd ₦2,500 received.\nDeduct ₦1,000 spent.\nClosing balance = ₦4,500.\nTry again or review the lesson.',
  },

  // ---------- MODULE 2 ----------
  '2-1': {
    moduleNumber: 2,
    lessonNumber: 1,
    title: 'Understanding Sales and Revenue',
    smsMessages: [
      'LESSON 1: What are sales?\nSales happen when a business sells goods or services to customers in exchange for money.',
      'Examples of sales include:\nSelling clothes, snacks, food, drinks, shoes or providing hairdressing services.',
      'REVENUE means the total amount earned from sales before business costs are deducted.',
      'Example:\nYou sell 10 pens for ₦300 each.\n10 x ₦300 = ₦3,000.\nYour sales revenue is ₦3,000.',
      'Remember:\nNumber of items sold x Selling price per item = Total sales revenue.',
      'A business can make many sales and still make a loss if its costs are too high.\nRevenue is not the same as profit.',
    ],
    question: 'TEST YOURSELF!\nYou sell 5 notebooks for ₦800 each.\nWhat is your total sales revenue?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '4000',
    correctFeedback: 'Correct!\n5 x ₦800 = ₦4,000.\nYour total sales revenue is ₦4,000.',
    incorrectFeedback: 'Try again!\nMultiply the number of notebooks by the selling price.\n5 x ₦800 = ₦4,000.\nYour total revenue is ₦4,000.',
  },
  '2-2': {
    moduleNumber: 2,
    lessonNumber: 2,
    title: 'Understanding Business Costs and Expenses',
    smsMessages: [
      'LESSON 2: What are business costs?\nBusiness costs are the amounts of money a business spends to buy goods and operate.',
      'Examples include:\nBuying stock, packaging, transport, shop rent, electricity and advertising.',
      'COST OF GOODS SOLD means the cost of the goods that were actually sold to customers.\nExample: You buy 10 shirts for ₦5,000 and sell all 10. Your cost of goods sold is ₦5,000.',
      'OTHER EXPENSES are payments made to operate the business.\nExamples include transport, rent and packaging.',
      'Example:\nYou sell goods for ₦8,000.\nThe goods cost ₦5,000.\nTransport costs ₦500.\nYour total costs and expenses are ₦5,500.',
      'Remember:\nBusiness costs reduce profit.\nAlways record the money spent, even when the amount is small.',
    ],
    question: 'TEST YOURSELF!\nYou earn ₦6,000 from sales.\nYour goods cost ₦3,500 and packaging costs ₦500.\nWhat is your total cost and expense?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '4000',
    correctFeedback: 'Well done!\n₦3,500 + ₦500 = ₦4,000.\nYour total cost and expenses are ₦4,000.',
    incorrectFeedback: 'Not quite.\nAdd the cost of goods and packaging.\n₦3,500 + ₦500 = ₦4,000.\nThe correct answer is ₦4,000.',
  },
  '2-3': {
    moduleNumber: 2,
    lessonNumber: 3,
    title: 'Calculating Profit and Loss',
    smsMessages: [
      'LESSON 3: What is profit?\nProfit is the money remaining after deducting the costs and expenses of a business from its revenue.',
      'A business makes a PROFIT when its revenue is greater than its costs and expenses.',
      'A business makes a LOSS when its costs and expenses are greater than its revenue.',
      'There are two useful profit calculations:\nGROSS PROFIT = Sales revenue - Cost of goods sold.',
      'NET PROFIT = Gross profit - Other business expenses.\nNet profit shows what remains after the costs of goods sold and other business expenses.',
      'Example:\nSales: ₦8,000\nGoods sold cost: ₦5,000\nOther expenses: ₦500\nGross profit = ₦3,000\nNet profit = ₦2,500',
      'Remember:\nRevenue is not profit.\nYou must deduct business costs and expenses before you know your profit.',
    ],
    question: 'TEST YOURSELF!\nYour sales are ₦10,000.\nGoods sold cost ₦6,000.\nOther expenses are ₦1,500.\nWhat is your net profit?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '2500',
    correctFeedback: 'Excellent!\nGross profit = ₦10,000 - ₦6,000 = ₦4,000.\nNet profit = ₦4,000 - ₦1,500 = ₦2,500.',
    incorrectFeedback: 'Not quite!\nFirst deduct the cost of goods:\n₦10,000 - ₦6,000 = ₦4,000.\nThen deduct other expenses:\n₦4,000 - ₦1,500 = ₦2,500.\nYour net profit is ₦2,500.',
  },

  // ---------- MODULE 3 ----------
  '3-1': {
    moduleNumber: 3,
    lessonNumber: 1,
    title: 'Recording Daily Business Transactions',
    smsMessages: [
      'LESSON 1: Daily business transactions.\nA transaction is any activity involving money received or money spent by a business.',
      'Examples include:\nSelling goods, buying stock, paying transport, receiving customer payments and paying rent.',
      'Record every transaction.\nDo not depend on memory.\nSmall payments are also important because they affect your business balance.',
      'Example:\nAda starts her business with ₦10,000.\nShe buys stock for ₦4,000.\nShe receives ₦6,000 from cash sales.',
      "Ada's closing cash:\n₦10,000 - ₦4,000 + ₦6,000 = ₦12,000.",
      'Ada should record the opening cash, stock purchase and sales separately.\nThis makes it easier to understand where the money came from and where it went.',
    ],
    question: 'TEST YOURSELF!\nYou start with ₦5,000.\nYou spend ₦2,000 on stock and receive ₦3,500 from cash sales.\nWhat is your closing cash?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '6500',
    correctFeedback: 'Correct!\n₦5,000 - ₦2,000 + ₦3,500 = ₦6,500.\nYou have calculated the closing cash correctly.',
    incorrectFeedback: "Let's calculate again.\nOpening cash: ₦5,000\nLess stock purchase: ₦2,000\nAdd cash sales: ₦3,500\nClosing cash = ₦6,500.",
  },
  '3-2': {
    moduleNumber: 3,
    lessonNumber: 2,
    title: 'Checking Your Cash Balance',
    smsMessages: [
      'LESSON 2: Checking your cash balance.\nA business owner should know how much cash is available at the end of each day.',
      'Use this formula:\nClosing cash = Opening cash + Cash received - Cash paid out.',
      'Example:\nOpening cash: ₦8,000\nCash received: ₦5,000\nCash paid out: ₦3,000',
      'Closing cash:\n₦8,000 + ₦5,000 - ₦3,000 = ₦10,000.',
      'Now count the actual cash in your business.\nCompare it with your calculated closing cash.',
      'If your records show ₦10,000 but you have only ₦9,500, there is a difference of ₦500.\nCheck your records for a missing payment or mistake.',
      'Never change your records just to make them match.\nFind and record the reason for the difference.',
    ],
    question: 'TEST YOURSELF!\nOpening cash: ₦6,000\nMoney received: ₦4,000\nMoney spent: ₦2,500\nWhat is the closing cash balance?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '7500',
    correctFeedback: 'Well done!\n₦6,000 + ₦4,000 - ₦2,500 = ₦7,500.\nYou have completed Lesson 2.',
    incorrectFeedback: 'Not quite.\nAdd money received to opening cash.\nThen subtract money spent.\n₦6,000 + ₦4,000 - ₦2,500 = ₦7,500.',
  },
  '3-3': {
    moduleNumber: 3,
    lessonNumber: 3,
    title: 'Mini Case Studies',
    smsMessages: [
      'LESSON 3: Business practice!\nYou will now learn from three small business examples.\nRead each example and calculate the answers.',
      'CASE 1: THE SNACK SELLER.\nAda starts her snack business with ₦5,000.\nShe buys snacks for ₦2,000 and sells all of them for ₦3,200.',
      "Question 1: What is Ada's closing cash balance?\nRemember: Opening cash - Purchase + Sales.",
      "Answer:\n₦5,000 - ₦2,000 + ₦3,200 = ₦6,200.",
      "Question 2: What is Ada's gross profit?\nSales - Cost of goods sold.",
      "Answer:\n₦3,200 - ₦2,000 = ₦1,200.\nAda's gross profit is ₦1,200 before other expenses.",
      'CASE 2: THE STATIONERY SELLER.\nChidi buys pens for ₦4,000 and sells them all for ₦6,500.\nHe also spends ₦500 on transport.',
      "Question: What is Chidi's net profit?",
      "Answer:\nSales: ₦6,500\nGoods: ₦4,000\nTransport: ₦500\nNet profit = ₦2,000.",
      'CASE 3: PHONE ACCESSORIES.\nAmaka starts with ₦10,000.\nShe buys accessories for ₦4,000, sells all of them for ₦6,000 and pays ₦1,000 for transport.',
      "Question 1: What is Amaka's closing cash balance?",
      "Answer:\n₦10,000 - ₦4,000 + ₦6,000 - ₦1,000 = ₦11,000.",
      "Question 2: What is Amaka's net profit?\n₦6,000 - ₦4,000 - ₦1,000 = ₦1,000.",
      'Important lesson:\nClosing cash and profit are not the same.\nClosing cash includes the original business money. Profit measures what the business earned after costs and expenses.',
    ],
    question: 'YOUR TURN!\nA business starts with ₦8,000.\nIt buys goods for ₦3,000 and sells all goods for ₦5,000.\nWhat is the closing cash balance?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '10000',
    correctFeedback: 'Excellent!\n₦8,000 - ₦3,000 + ₦5,000 = ₦10,000.',
    incorrectFeedback: "Let's try again.\nOpening cash: ₦8,000\nLess purchases: ₦3,000\nAdd sales: ₦5,000\nClosing cash = ₦10,000.",
  },

  // ---------- MODULE 4 ----------
  '4-1': {
    moduleNumber: 4,
    lessonNumber: 1,
    title: 'Understanding and Recording Business Stock',
    smsMessages: [
      'LESSON 1: What is stock?\nStock means the goods a business keeps to sell to customers.\nExamples: clothes, shoes, food, drinks and phone accessories.',
      'When you buy goods to sell, your stock increases.\nWhen you sell goods, your stock decreases.',
      'Always record how many items you buy and how many items you sell.\nThis helps you know what remains.',
      'Example:\nBola buys 20 bottles of drinks.\nShe sells 8 bottles.\nHow many bottles remain?',
      'Answer:\n20 - 8 = 12 bottles.\nBola has 12 bottles remaining.',
      'A stock record should show:\nDate, item name, quantity bought, quantity sold and quantity remaining.',
      'Check your stock regularly.\nIf your records show 12 bottles but you count only 10, investigate the difference.',
    ],
    question: 'TEST YOURSELF!\nYou buy 30 notebooks.\nYou sell 12 notebooks.\nHow many notebooks remain?\nReply with the number only.',
    validateAnswer: (a) => normalizeAmount(a) === '18',
    correctFeedback: 'Correct!\n30 - 12 = 18 notebooks.\nYour remaining stock is 18.',
    incorrectFeedback: 'Try again!\nStock remaining = Stock bought - Stock sold.\n30 - 12 = 18 notebooks.',
  },
  '4-2': {
    moduleNumber: 4,
    lessonNumber: 2,
    title: 'Recording Stock Purchases and Sales',
    smsMessages: [
      'LESSON 2: Recording stock purchases and sales.\nEvery stock purchase and sale should be recorded.',
      'When buying stock, record:\nDate, item, quantity, total cost and payment made.',
      'When selling stock, record:\nDate, item, quantity sold and selling price.',
      'Example:\nYou buy 10 bags for ₦2,000 each.\nTotal purchase cost = 10 x ₦2,000 = ₦20,000.',
      'You later sell 4 bags for ₦3,000 each.\nSales revenue = 4 x ₦3,000 = ₦12,000.',
      'You have sold 4 bags out of 10.\nRemaining stock = 10 - 4 = 6 bags.',
      'Keep purchase records and sales records separate.\nThis helps you calculate the cost of goods sold and your profit.',
    ],
    question: 'TEST YOURSELF!\nYou buy 15 pairs of slippers.\nYou sell 6 pairs.\nHow many pairs remain?\nReply with the number only.',
    validateAnswer: (a) => normalizeAmount(a) === '9',
    correctFeedback: 'Well done!\n15 - 6 = 9 pairs.\nYou have 9 pairs remaining.',
    incorrectFeedback: 'Not quite.\nSubtract the number sold from the number bought.\n15 - 6 = 9 pairs.',
  },
  '4-3': {
    moduleNumber: 4,
    lessonNumber: 3,
    title: 'Understanding Customer and Supplier Credit',
    smsMessages: [
      'LESSON 3: What is credit?\nCredit means receiving goods or services now and agreeing to pay later, or allowing a customer to pay later.',
      'CUSTOMER DEBT:\nA customer takes goods but has not paid.\nThe customer owes your business money.',
      'SUPPLIER DEBT:\nYour business receives goods from a supplier but has not paid.\nYour business owes the supplier money.',
      'Example:\nYou sell clothes worth ₦5,000 to a customer on credit.\nThe customer now owes your business ₦5,000.',
      "Record the customer's name, date, amount owed and payment received later.\nThis helps you remember who must pay.",
      'Another example:\nYou receive stock worth ₦8,000 from a supplier but agree to pay next week.\nYour business owes the supplier ₦8,000.',
      'When a customer pays later, record the payment and reduce the amount they owe.\nWhen you pay a supplier, record the payment and reduce your debt.',
    ],
    question: 'TEST YOURSELF!\nYou sell goods worth ₦3,000 to Tunde on credit.\nHow much does Tunde owe your business?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '3000',
    correctFeedback: 'Correct!\nTunde owes your business ₦3,000.\nThis is money your business expects to receive.',
    incorrectFeedback: 'Remember:\nWhen a customer receives goods but does not pay, the customer owes your business.\nTunde owes ₦3,000.',
  },

  // ---------- MODULE 5 ----------
  '5-1': {
    moduleNumber: 5,
    lessonNumber: 1,
    title: 'Organising and Keeping Business Records',
    smsMessages: [
      'LESSON 1: Keeping business records.\nA business record is written information about the activities and transactions of a business.',
      'Important records include:\n1. Sales records\n2. Expense records\n3. Stock records\n4. Cashbook\n5. Customer debts\n6. Supplier debts',
      'Keep your records organised by date.\nThis makes it easier to find information when you need it.',
      'Keep receipts, invoices and payment evidence.\nThey help you confirm that transactions really happened.',
      "Example:\nYou buy goods for ₦10,000.\nKeep the supplier's receipt and record the purchase in your business records.",
      'Do not mix personal spending with business spending.\nRecord business transactions separately.\nThis helps you understand how your business is performing.',
      'Review your records regularly.\nGood records help you avoid mistakes and understand your business.',
    ],
    question: 'TEST YOURSELF!\nYou buy goods for ₦5,000.\nWhich document should you keep as proof of payment?\nReply with your answer.',
    validateAnswer: (a) => a.toLowerCase().includes('receipt'),
    correctFeedback: 'Correct!\nA receipt provides evidence of a purchase or payment.\nKeep it with your business records.',
    incorrectFeedback: 'Not quite.\nYou should keep a receipt as evidence of the purchase or payment.\nTry again.',
  },
  '5-2': {
    moduleNumber: 5,
    lessonNumber: 2,
    title: 'Preparing a Simple Business Summary',
    smsMessages: [
      'LESSON 2: Your business summary.\nA business summary shows how your business performed during a period, such as one week.',
      'At the end of each week, add your total sales.\nThis shows how much your business earned from selling goods or services.',
      'Next, add your cost of goods sold and other business expenses.\nThese show how much the business spent.',
      'Example:\nWeekly sales = ₦20,000\nCost of goods sold = ₦12,000\nOther expenses = ₦3,000',
      'Calculate gross profit:\n₦20,000 - ₦12,000 = ₦8,000.',
      'Calculate net profit:\n₦8,000 - ₦3,000 = ₦5,000.\nYour net profit is ₦5,000.',
      'A weekly summary helps you understand whether your business is making a profit or a loss.\nRemember to include only costs and expenses relating to that period.',
    ],
    question: 'TEST YOURSELF!\nWeekly sales: ₦15,000\nCost of goods sold: ₦9,000\nOther expenses: ₦2,000\nWhat is your net profit?\nReply with the amount only.',
    validateAnswer: (a) => normalizeAmount(a) === '4000',
    correctFeedback: 'Excellent!\nGross profit = ₦15,000 - ₦9,000 = ₦6,000.\nNet profit = ₦6,000 - ₦2,000 = ₦4,000.\nYou calculated your net profit correctly.',
    incorrectFeedback: "Let's calculate.\nSales: ₦15,000\nGoods cost: ₦9,000\nOther expenses: ₦2,000\nNet profit = ₦15,000 - ₦9,000 - ₦2,000 = ₦4,000.",
  },
  '5-3': {
    moduleNumber: 5,
    lessonNumber: 3,
    title: 'Using Bookkeeping to Make Business Decisions',
    smsMessages: [
      'LESSON 3: Making better business decisions.\nBookkeeping helps you understand what is happening in your business.',
      'Your records can show:\nWhich products sell most.\nWhich products sell slowly.\nHow much money you spend.\nWhether your business makes a profit or loss.',
      'Example:\nYou sell 20 bottles of water but only 3 bottles of juice in one week.\nWater sells faster than juice.',
      'You may decide to buy more water next week.\nBut always check the cost, selling price and demand before buying more stock.',
      'If your expenses are too high, review them.\nLook for ways to reduce unnecessary spending without reducing the quality of your products.',
      'If customers owe you money, follow up on their payments.\nUnpaid customer debts can affect the cash available to run your business.',
      'Remember:\nGood business decisions should be based on accurate records, not guesses.',
    ],
    question: 'FINAL TEST!\nYour business sells:\n20 bottles of water.\n3 bottles of juice.\nWhich product sold more?\nReply with your answer.',
    validateAnswer: (a) => a.toLowerCase().includes('water'),
    correctFeedback: 'Correct! Water sold more.\nYour sales records help you understand which products customers buy most.\nYou have completed the final lesson!',
    incorrectFeedback: 'Not quite.\n20 bottles of water were sold.\nOnly 3 bottles of juice were sold.\nWater sold more.',
  },
};

const MODULE_NAMES: Record<number, string> = {
  1: 'Recording Money In and Out',
  2: 'Sales, Costs and Profit',
  3: 'Practical Bookkeeping',
  4: 'Managing Stock and Credit',
  5: 'Reviewing Business Records',
};

const MODULE_OVERVIEWS: Record<number, string> = {
  1: 'In this module, you will learn:\nLesson 1: Understanding Money In and Money Out.\nLesson 2: Recording Dates and Descriptions.\nLesson 3: Keeping a Simple Cashbook.',
  2: 'In this module, you will learn:\nLesson 1: Understanding Sales and Revenue.\nLesson 2: Understanding Business Costs and Expenses.\nLesson 3: Calculating Profit and Loss.',
  3: 'In this module, you will learn:\nLesson 1: Recording Daily Business Transactions.\nLesson 2: Checking Your Cash Balance.\nLesson 3: Mini Case Studies.',
  4: 'In this module, you will learn:\nLesson 1: Understanding and Recording Business Stock.\nLesson 2: Recording Stock Purchases and Sales.\nLesson 3: Understanding Customer and Supplier Credit.',
  5: 'In this module, you will learn:\nLesson 1: Organising and Keeping Business Records.\nLesson 2: Preparing a Simple Business Summary.\nLesson 3: Using Bookkeeping to Make Business Decisions.',
};

// ============================================================
// STATE MACHINE (stateless — reconstructed from USSD path)
// ============================================================

type USSDPhase =
  | 'main_menu'
  | 'progress'
  | 'lesson_menu'
  | 'module_overview'
  | 'showing_slide'
  | 'showing_question'
  | 'showing_feedback_correct'
  | 'showing_feedback_incorrect'
  | 'module_complete'
  | 'course_complete'
  | 'finished';

interface USSDState {
  phase: USSDPhase;
  module: number;
  lesson: number;
  slideIndex: number;
  lastAnswer?: string;
  isCorrect?: boolean;
}

const getLesson = (m: number, l: number): LessonContent | undefined => LESSONS[`${m}-${l}`];

const applyAction = (state: USSDState, action: string): USSDState => {
  switch (state.phase) {
    case 'main_menu':
      if (action === '6') return { ...state, phase: 'progress' };
      if (['1', '2', '3', '4', '5'].includes(action)) {
        return { module: Number(action), lesson: 0, slideIndex: 0, phase: 'lesson_menu' };
      }
      return state;

    case 'lesson_menu':
      if (action === '4') return { ...state, phase: 'module_overview' };
      if (action === '5' || action === '0') return { ...state, phase: 'main_menu' };
      if (['1', '2', '3'].includes(action)) {
        return { ...state, lesson: Number(action), slideIndex: 0, phase: 'showing_slide' };
      }
      return state;

    case 'module_overview':
      if (action === '1') return { ...state, lesson: 1, slideIndex: 0, phase: 'showing_slide' };
      if (action === '0') return { ...state, phase: 'lesson_menu' };
      return state;

    case 'showing_slide': {
      if (action === '0') return { ...state, phase: 'lesson_menu' };
      if (action !== '1') return state;
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return { ...state, phase: 'lesson_menu' };
      const nextSlide = state.slideIndex + 1;
      if (nextSlide >= lesson.smsMessages.length) {
        return { ...state, slideIndex: nextSlide, phase: 'showing_question' };
      }
      return { ...state, slideIndex: nextSlide };
    }

    case 'showing_question': {
      if (action === '0') return { ...state, phase: 'lesson_menu' };
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return { ...state, phase: 'main_menu' };
      const isCorrect = lesson.validateAnswer(action.toLowerCase().trim());
      if (!isCorrect) {
        return { ...state, lastAnswer: action, isCorrect: false, phase: 'showing_feedback_incorrect' };
      }
      if (state.lesson >= 3) {
        return {
          ...state,
          lastAnswer: action,
          isCorrect: true,
          phase: state.module >= 5 ? 'course_complete' : 'module_complete',
        };
      }
      return { ...state, lastAnswer: action, isCorrect: true, phase: 'showing_feedback_correct' };
    }

    case 'showing_feedback_correct':
      if (action === '1') return { ...state, lesson: state.lesson + 1, slideIndex: 0, phase: 'showing_slide' };
      if (action === '2') return { ...state, slideIndex: 0, phase: 'showing_slide' };
      if (action === '3') return { ...state, phase: 'main_menu' };
      return state;

    case 'showing_feedback_incorrect':
      if (action === '1') {
        const lesson = getLesson(state.module, state.lesson);
        return {
          ...state,
          slideIndex: lesson ? lesson.smsMessages.length : 0,
          phase: 'showing_question',
        };
      }
      if (action === '2') return { ...state, slideIndex: 0, phase: 'showing_slide' };
      if (action === '3') return { ...state, phase: 'main_menu' };
      return state;

    case 'module_complete':
      if (action === '1') {
        return { module: state.module + 1, lesson: 0, slideIndex: 0, phase: 'lesson_menu' };
      }
      if (action === '2') {
        return { ...state, lesson: 0, slideIndex: 0, phase: 'lesson_menu' };
      }
      if (action === '3') return { ...state, phase: 'main_menu' };
      return state;

    case 'course_complete':
      if (action === '1') {
        return { module: 1, lesson: 0, slideIndex: 0, phase: 'lesson_menu' };
      }
      if (action === '2') return { ...state, phase: 'progress' };
      if (action === '3') return { ...state, phase: 'finished' };
      return state;

    case 'progress':
    case 'finished':
      return state;

    default:
      return state;
  }
};

const simulatePath = (segments: string[]): USSDState => {
  let state: USSDState = { phase: 'main_menu', module: 0, lesson: 0, slideIndex: 0 };
  for (const seg of segments) {
    if (seg === '') continue;
    state = applyAction(state, seg);
  }
  return state;
};

// ============================================================
// RENDER
// ============================================================

const renderState = (state: USSDState, phoneNumber: string, completedCount: number): string => {
  switch (state.phase) {
    case 'main_menu': {
      return (
        `CON Welcome to Basic Bookkeeping.\n` +
        `Choose the module you want to study:\n` +
        `1. Recording Money In and Out\n` +
        `2. Sales, Costs and Profit\n` +
        `3. Practical Bookkeeping\n` +
        `4. Managing Stock and Credit\n` +
        `5. Reviewing Business Records\n` +
        `6. My Progress`
      );
    }

    case 'progress':
      return `END Your phone number (${phoneNumber}) has completed ${completedCount} out of 15 lessons. Keep learning!`;

    case 'lesson_menu': {
      return (
        `CON MODULE ${state.module}: ${MODULE_NAMES[state.module]}\n` +
        `Choose a Lesson:\n` +
        `1. Start Lesson 1\n` +
        `2. Start Lesson 2\n` +
        `3. Start Lesson 3\n` +
        `4. Module Overview\n` +
        `5. Main Menu`
      );
    }

    case 'module_overview':
      return `CON ${MODULE_OVERVIEWS[state.module]}\n\n1. Start Lesson 1\n0. Back`;

    case 'showing_slide': {
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return `CON Lesson not found.\n0. Back`;
      const sms = lesson.smsMessages[state.slideIndex] ?? '';
      return `CON ${sms}\n\n1. Next\n0. Back`;
    }

    case 'showing_question': {
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return `CON Lesson not found.\n0. Back`;
      return `CON ${lesson.question}`;
    }

    case 'showing_feedback_correct': {
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return `CON Correct!\n1. Next Lesson\n2. Repeat Lesson\n3. Main Menu`;
      return `CON ${lesson.correctFeedback}\n\nReply:\n1. Next Lesson\n2. Repeat Lesson\n3. Main Menu`;
    }

    case 'showing_feedback_incorrect': {
      const lesson = getLesson(state.module, state.lesson);
      if (!lesson) return `CON Not quite.\n1. Try Again\n2. Repeat Lesson\n3. Main Menu`;
      return `CON ${lesson.incorrectFeedback}\n\nReply:\n1. Try Again\n2. Repeat Lesson\n3. Main Menu`;
    }

    case 'module_complete': {
      const lesson = getLesson(state.module, 3);
      const summary: Record<number, string> = {
        1: 'You now understand how to record money received and spent.',
        2: 'You now understand sales, costs and profit.',
        3: 'You now understand practical bookkeeping.',
        4: 'You now understand stock and credit.',
      };
      const nextModuleLine = state.module < 5
        ? `1. Start Module ${state.module + 1}`
        : `1. Review Course`;
      return (
        `CON ${lesson?.correctFeedback ?? 'Correct!'}\n\n` +
        `CONGRATULATIONS! You have completed Module ${state.module}.\n` +
        `${summary[state.module] ?? ''}\n\n` +
        `Reply:\n${nextModuleLine}\n2. Review Module ${state.module}\n3. Main Menu`
      );
    }

    case 'course_complete': {
      const lesson = getLesson(5, 3);
      return (
        `CON ${lesson?.correctFeedback ?? 'Correct!'}\n\n` +
        `CONGRATULATIONS! You have completed the Basic Bookkeeping Course!\n` +
        `You have learned how to:\n` +
        `1. Record money received and spent.\n` +
        `2. Calculate sales, costs and profit.\n` +
        `3. Manage daily business transactions.\n` +
        `4. Record stock and credit.\n` +
        `5. Review business records and make decisions.\n\n` +
        `Reply:\n1. Review Course\n2. View My Progress\n3. Finish`
      );
    }

    case 'finished':
      return `END Thank you for learning with us! You are now ready to apply basic bookkeeping in a small business.`;

    default:
      return `END Session ended.`;
  }
};

// ============================================================
// MAIN HANDLER
// ============================================================

export const handleUSSD = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  logger.info('Incoming USSD request', { sessionId, phoneNumber, text });

  try {
    // 1. Ensure user exists (auto-register by phone number)
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

    // 2. Parse the accumulated USSD path
    const textArray = text === '' ? [] : text.split('*');

    // 3. Simulate previous state and current state
    const prevState = textArray.length > 0 ? simulatePath(textArray.slice(0, -1)) : null;
    const state = simulatePath(textArray);

    // 4. Persist progress whenever a correct answer was just submitted
    if (
      prevState &&
      prevState.phase === 'showing_question' &&
      state.isCorrect === true &&
      prevState.module >= 1 &&
      prevState.module <= 5 &&
      prevState.lesson >= 1 &&
      prevState.lesson <= 3
    ) {
      const lessonId = ((prevState.module - 1) * 3) + prevState.lesson;
      await pool
        .query(
          `INSERT INTO user_progress (user_id, lesson_id, status)
           VALUES ($1, $2, 'completed')
           ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed'`,
          [userId, lessonId]
        )
        .catch((err) => logger.error('Failed to save progress', err));
    }

    // 5. Fetch completed count if progress screen is being shown
    let completedCount = 0;
    if (state.phase === 'progress') {
      const progressResult = await pool.query(
        'SELECT COUNT(DISTINCT lesson_id) AS completed FROM user_progress WHERE user_id = $1',
        [userId]
      );
      completedCount = Number(progressResult.rows[0]?.completed ?? 0);
    }

    // 6. Render and return
    const response = renderState(state, phoneNumber, completedCount);
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(response);
  } catch (error: any) {
    logger.error('Error processing USSD request', {
      message: error?.message,
      stack: error?.stack,
      sessionId,
      phoneNumber,
    });
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('END An unexpected error occurred. Please try again later.');
  }
};
