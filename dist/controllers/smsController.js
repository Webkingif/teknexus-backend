// @ts-ignore
import AfricasTalking from 'africastalking';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';
// Initialize Africa's Talking SDK
const africasTalking = AfricasTalking({
    apiKey: process.env.AT_API_KEY || 'your_api_key',
    username: process.env.AT_USERNAME || 'sandbox',
});
const sms = africasTalking.SMS;
// ============================================================
// HELPERS
// ============================================================
const normalizeAmount = (a) => a.replace(/[^0-9]/g, '').trim();
const normalizeText = (a) => a.toLowerCase().trim();
/**
 * Sends an SMS via Africa's Talking and returns the API result.
 */
const sendSMS = async (to, message) => {
    const result = await sms.send({ to: [to], message });
    logger.info('Africa Talking SMS response:', result);
    return result;
};
// ============================================================
// COURSE CONTENT DEFINITION
// ============================================================
const MODULES = [
    // ----------------------------------------------------------
    // MODULE 1: RECORDING MONEY IN AND MONEY OUT
    // ----------------------------------------------------------
    {
        id: 1,
        title: 'Recording Money In and Money Out',
        lessons: [
            {
                id: 1,
                module: 1,
                lessonNumber: 1,
                title: 'Understanding Money In and Money Out',
                teachingMessages: [
                    'LESSON 1: What is bookkeeping?\nBookkeeping means keeping clear records of all money received and money spent by a person or business.',
                    'Bookkeeping helps you know how much money comes in, how much goes out and how much remains.',
                    'MONEY IN means money received by your business.\nExamples: money from sales, customer payments and business services.',
                    'MONEY OUT means money paid by your business.\nExamples: buying goods, transport, packaging, electricity and rent.',
                    'Example: Ada sells snacks for N5,000. She receives N5,000. This is MONEY IN.\nAda also spends N1,500 buying packaging materials. This is MONEY OUT.',
                    'Remember: Sales bring money in. Business payments take money out.',
                ],
                question: 'TEST YOURSELF!\nYou receive N5,000 from sales and spend N1,500 on transport.\nHow much money remains?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '3500',
                successMessage: 'Correct! Well done.\nN5,000 - N1,500 = N3,500.\nYou understand money in and money out.',
                failureMessage: 'Not quite. Remember:\nMoney received is added. Money spent is deducted.\nN5,000 - N1,500 = N3,500.\nThe correct answer is N3,500.',
            },
            {
                id: 2,
                module: 1,
                lessonNumber: 2,
                title: 'Recording Dates and Descriptions',
                teachingMessages: [
                    'LESSON 2: Recording transactions.\nEvery time money enters or leaves your business, you should record what happened.',
                    'A good transaction record needs three important details:\nDate\nDescription\nAmount',
                    'DATE means the day the transaction happened.\nExample: 30 October 2026.\nAlways use the correct transaction date.',
                    'DESCRIPTION means a short explanation of what happened.\nExamples: Sold snacks, bought rice or paid transport.',
                    'AMOUNT means how much money was received or spent.\nExample: 2,000 received from snack sales.',
                    'Example of a complete record:\nDate: 30 October 2026\nDescription: Sold snacks\nAmount: 2,000 received.\nThis makes your records easy to understand.',
                ],
                question: 'TEST YOURSELF!\nYou spend N500 on transport today.\nWhich THREE details should you record?\nReply with the three details.',
                validate: (a) => {
                    const s = normalizeText(a);
                    return s.includes('date') && s.includes('description') && s.includes('amount');
                },
                successMessage: 'Excellent!\nYou need:\nDate: Today\nDescription: Transport\nAmount: 500 spent.\nYou have completed Lesson 2.',
                failureMessage: 'Almost there! Remember the three details:\nDate: When it happened.\nDescription: What happened.\nAmount: How much money.\nTry again. Reply with all three.',
            },
            {
                id: 3,
                module: 1,
                lessonNumber: 3,
                title: 'Keeping a Simple Cashbook',
                teachingMessages: [
                    'LESSON 3: What is a cashbook?\nA cashbook is a record of money received and money paid out by a business.',
                    'A simple cashbook records:\nDate\nDescription\nMoney IN\nMoney OUT\nBalance',
                    'OPENING BALANCE means the money available at the beginning of a day or period.\nExample: You start your business day with N4,000.',
                    'CLOSING BALANCE means the cash remaining after adding money received and deducting money spent.',
                    'Remember this formula:\nClosing cash = Opening cash + Money IN - Money OUT.',
                    'Example:\nOpening cash: N4,000\nSales received: N2,000\nTransport paid: N500\nClosing cash = N5,500.',
                    'A cashbook helps you check whether the money you have agrees with your records.\nRecord transactions as they happen, not only at the end of the month.',
                ],
                question: 'TEST YOURSELF!\nYou start with N3,000.\nYou receive N2,500 from sales and spend N1,000.\nWhat is your closing cash balance?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '4500',
                successMessage: 'Correct!\nN3,000 + N2,500 - N1,000 = N4,500.\nCongratulations! You have completed Module 1.',
                failureMessage: 'Not quite.\nStart with N3,000.\nAdd N2,500 received.\nDeduct N1,000 spent.\nClosing balance = N4,500.\nTry again or review the lesson.',
            },
        ],
    },
    // ----------------------------------------------------------
    // MODULE 2: UNDERSTANDING SALES, COSTS AND PROFIT
    // ----------------------------------------------------------
    {
        id: 2,
        title: 'Understanding Sales, Costs and Profit',
        lessons: [
            {
                id: 4,
                module: 2,
                lessonNumber: 1,
                title: 'Understanding Sales and Revenue',
                teachingMessages: [
                    'LESSON 1: What are sales?\nSales happen when a business sells goods or services to customers in exchange for money.',
                    'Examples of sales include: selling clothes, snacks, food, drinks, shoes or providing hairdressing services.',
                    'REVENUE means the total amount earned from sales before business costs are deducted.',
                    'Example: You sell 10 pens for N300 each.\n10 x N300 = N3,000.\nYour sales revenue is N3,000.',
                    'Remember:\nNumber of items sold x Selling price per item = Total sales revenue.',
                    'A business can make many sales and still make a loss if its costs are too high.\nRevenue is not the same as profit.',
                ],
                question: 'TEST YOURSELF!\nYou sell 5 notebooks for N800 each.\nWhat is your total sales revenue?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '4000',
                successMessage: 'Correct!\n5 x N800 = N4,000.\nYour total sales revenue is N4,000.',
                failureMessage: 'Try again!\nMultiply the number of notebooks by the selling price.\n5 x N800 = N4,000.\nYour total revenue is N4,000.',
            },
            {
                id: 5,
                module: 2,
                lessonNumber: 2,
                title: 'Understanding Business Costs and Expenses',
                teachingMessages: [
                    'LESSON 2: What are business costs?\nBusiness costs are the amounts of money a business spends to buy goods and operate.',
                    'Examples include: buying stock, packaging, transport, shop rent, electricity and advertising.',
                    'COST OF GOODS SOLD means the cost of the goods that were actually sold to customers.\nExample: You buy 10 shirts for N5,000 and sell all 10 shirts. Your cost of goods sold is N5,000.',
                    'OTHER EXPENSES are payments made to operate the business.\nExamples include transport, rent and packaging.',
                    'Example: You sell goods for N8,000. The goods cost N5,000. Transport costs N500.\nYour total costs and expenses are N5,500.',
                    'Remember: Business costs reduce profit.\nAlways record the money spent, even when the amount is small.',
                ],
                question: 'TEST YOURSELF!\nYou earn N6,000 from sales.\nYour goods cost N3,500 and packaging costs N500.\nWhat is your total cost and expense?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '4000',
                successMessage: 'Well done!\nN3,500 + N500 = N4,000.\nYour total cost and expenses are N4,000.',
                failureMessage: 'Not quite.\nAdd the cost of goods and packaging.\nN3,500 + N500 = N4,000.\nThe correct answer is N4,000.',
            },
            {
                id: 6,
                module: 2,
                lessonNumber: 3,
                title: 'Calculating Profit and Loss',
                teachingMessages: [
                    'LESSON 3: What is profit?\nProfit is the money remaining after deducting the costs and expenses of a business from its revenue.',
                    'A business makes a PROFIT when its revenue is greater than its costs and expenses.',
                    'A business makes a LOSS when its costs and expenses are greater than its revenue.',
                    'There are two useful profit calculations.\nGROSS PROFIT = Sales revenue - Cost of goods sold.',
                    'NET PROFIT = Gross profit - Other business expenses.\nNet profit shows what remains after the costs of goods sold and other business expenses.',
                    'Example:\nSales: N8,000\nGoods sold cost: N5,000\nOther expenses: N500\nGross profit = N3,000\nNet profit = N2,500',
                    'Remember: Revenue is not profit.\nYou must deduct business costs and expenses before you know your profit.',
                ],
                question: 'TEST YOURSELF!\nYour sales are N10,000.\nGoods sold cost N6,000.\nOther expenses are N1,500.\nWhat is your net profit?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '2500',
                successMessage: 'Excellent!\nGross profit = N10,000 - N6,000 = N4,000.\nNet profit = N4,000 - N1,500 = N2,500.\nYou have completed Module 2.',
                failureMessage: 'Not quite!\nFirst deduct the cost of goods:\nN10,000 - N6,000 = N4,000.\nThen deduct other expenses:\nN4,000 - N1,500 = N2,500.\nYour net profit is N2,500.',
            },
        ],
    },
    // ----------------------------------------------------------
    // MODULE 3: PRACTICAL BOOKKEEPING
    // ----------------------------------------------------------
    {
        id: 3,
        title: 'Practical Bookkeeping',
        lessons: [
            {
                id: 7,
                module: 3,
                lessonNumber: 1,
                title: 'Recording Daily Business Transactions',
                teachingMessages: [
                    'LESSON 1: Daily business transactions.\nA transaction is any activity involving money received or money spent by a business.',
                    'Examples include: selling goods, buying stock, paying transport, receiving customer payments and paying rent.',
                    'Record every transaction.\nDo not depend on memory.\nSmall payments are also important because they affect your business balance.',
                    "Example:\nAda starts her business with N10,000.\nShe buys stock for N4,000.\nShe receives N6,000 from cash sales.",
                    "Ada's closing cash:\nN10,000 - N4,000 + N6,000 = N12,000.",
                    'Ada should record the opening cash, stock purchase and sales separately.\nThis makes it easier to understand where the money came from and where it went.',
                ],
                question: 'TEST YOURSELF!\nYou start with N5,000.\nYou spend N2,000 on stock and receive N3,500 from cash sales.\nWhat is your closing cash?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '6500',
                successMessage: 'Correct!\nN5,000 - N2,000 + N3,500 = N6,500.\nYou have calculated the closing cash correctly.',
                failureMessage: "Let's calculate again.\nOpening cash: N5,000\nLess stock purchase: N2,000\nAdd cash sales: N3,500\nClosing cash = N6,500.",
            },
            {
                id: 8,
                module: 3,
                lessonNumber: 2,
                title: 'Checking Your Cash Balance',
                teachingMessages: [
                    'LESSON 2: Checking your cash balance.\nA business owner should know how much cash is available at the end of each day.',
                    'Use this formula:\nClosing cash = Opening cash + Cash received - Cash paid out.',
                    'Example:\nOpening cash: N8,000\nCash received: N5,000\nCash paid out: N3,000',
                    'Closing cash:\nN8,000 + N5,000 - N3,000 = N10,000.',
                    'Now count the actual cash in your business.\nCompare it with your calculated closing cash.',
                    'If your records show N10,000 but you have only N9,500, there is a difference of N500.\nCheck your records for a missing payment or mistake.',
                    'Never change your records just to make them match.\nFind and record the reason for the difference.',
                ],
                question: 'TEST YOURSELF!\nOpening cash: N6,000\nMoney received: N4,000\nMoney spent: N2,500\nWhat is the closing cash balance?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '7500',
                successMessage: 'Well done!\nN6,000 + N4,000 - N2,500 = N7,500.\nYou have completed Lesson 2.',
                failureMessage: 'Not quite.\nAdd money received to opening cash.\nThen subtract money spent.\nN6,000 + N4,000 - N2,500 = N7,500.',
            },
            {
                id: 9,
                module: 3,
                lessonNumber: 3,
                title: 'Mini Case Studies - Run a Business',
                teachingMessages: [
                    'LESSON 3: Business practice!\nYou will now learn from three small business examples.\nRead each example and calculate the answers.',
                    'CASE 1: THE SNACK SELLER.\nAda starts her snack business with N5,000.\nShe buys snacks for N2,000 and sells all of them for N3,200.',
                    "Question 1: What is Ada's closing cash balance?\nRemember: Opening cash - Purchase + Sales.\nAnswer: N5,000 - N2,000 + N3,200 = N6,200.",
                    "Question 2: What is Ada's gross profit?\nSales - Cost of goods sold.\nAnswer: N3,200 - N2,000 = N1,200.\nAda's gross profit is N1,200 before other expenses.",
                    'CASE 2: THE STATIONERY SELLER.\nChidi buys pens for N4,000 and sells them all for N6,500.\nHe also spends N500 on transport.\nQuestion: What is Chidi\'s net profit?\nAnswer: Sales N6,500 - Goods N4,000 - Transport N500 = N2,000.',
                    'CASE 3: PHONE ACCESSORIES.\nAmaka starts with N10,000.\nShe buys accessories for N4,000, sells all for N6,000 and pays N1,000 for transport.\nQuestion: Closing cash?\nAnswer: N10,000 - N4,000 + N6,000 - N1,000 = N11,000.\nQuestion: Net profit?\nAnswer: N6,000 - N4,000 - N1,000 = N1,000.',
                    'Important lesson:\nClosing cash and profit are not the same.\nClosing cash includes the original business money. Profit measures what the business earned after costs and expenses.',
                ],
                question: 'YOUR TURN!\nA business starts with N8,000.\nIt buys goods for N3,000 and sells all goods for N5,000.\nWhat is the closing cash balance?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '10000',
                successMessage: 'Excellent!\nN8,000 - N3,000 + N5,000 = N10,000.\nYou have completed Module 3.',
                failureMessage: "Let's try again.\nOpening cash: N8,000\nLess purchases: N3,000\nAdd sales: N5,000\nClosing cash = N10,000.",
            },
        ],
    },
    // ----------------------------------------------------------
    // MODULE 4: MANAGING BUSINESS STOCK AND CREDIT
    // ----------------------------------------------------------
    {
        id: 4,
        title: 'Managing Business Stock and Credit',
        lessons: [
            {
                id: 10,
                module: 4,
                lessonNumber: 1,
                title: 'Understanding and Recording Business Stock',
                teachingMessages: [
                    'LESSON 1: What is stock?\nStock means the goods a business keeps to sell to customers.\nExamples: clothes, shoes, food, drinks and phone accessories.',
                    'When you buy goods to sell, your stock increases.\nWhen you sell goods, your stock decreases.',
                    'Always record how many items you buy and how many items you sell.\nThis helps you know what remains.',
                    'Example:\nBola buys 20 bottles of drinks.\nShe sells 8 bottles.\nHow many bottles remain?\nAnswer: 20 - 8 = 12 bottles.\nBola has 12 bottles remaining.',
                    'A stock record should show:\nDate, item name, quantity bought, quantity sold and quantity remaining.',
                    'Check your stock regularly.\nIf your records show 12 bottles but you count only 10, investigate the difference.',
                ],
                question: 'TEST YOURSELF!\nYou buy 30 notebooks.\nYou sell 12 notebooks.\nHow many notebooks remain?\nReply with the number only.',
                validate: (a) => normalizeAmount(a) === '18',
                successMessage: 'Correct!\n30 - 12 = 18 notebooks.\nYour remaining stock is 18.',
                failureMessage: 'Try again!\nStock remaining = Stock bought - Stock sold.\n30 - 12 = 18 notebooks.',
            },
            {
                id: 11,
                module: 4,
                lessonNumber: 2,
                title: 'Recording Stock Purchases and Sales',
                teachingMessages: [
                    'LESSON 2: Recording stock purchases and sales.\nEvery stock purchase and sale should be recorded.',
                    'When buying stock, record:\nDate, item, quantity, total cost and payment made.',
                    'When selling stock, record:\nDate, item, quantity sold and selling price.',
                    'Example:\nYou buy 10 bags for N2,000 each.\nTotal cost = 10 x N2,000 = N20,000.',
                    'You later sell 4 bags for N3,000 each.\nSales revenue = 4 x N3,000 = N12,000.',
                    'You have sold 4 bags out of 10.\nRemaining stock = 10 - 4 = 6 bags.',
                    'Keep purchase records and sales records separate.\nThis helps you calculate the cost of goods sold and your profit.',
                ],
                question: 'TEST YOURSELF!\nYou buy 15 pairs of slippers.\nYou sell 6 pairs.\nHow many pairs remain?\nReply with the number only.',
                validate: (a) => normalizeAmount(a) === '9',
                successMessage: 'Well done!\n15 - 6 = 9 pairs.\nYou have 9 pairs remaining.',
                failureMessage: 'Not quite.\nSubtract the number sold from the number bought.\n15 - 6 = 9 pairs.',
            },
            {
                id: 12,
                module: 4,
                lessonNumber: 3,
                title: 'Understanding Customer and Supplier Credit',
                teachingMessages: [
                    'LESSON 3: What is credit?\nCredit means receiving goods or services now and agreeing to pay later, or allowing a customer to pay later.',
                    'CUSTOMER DEBT:\nA customer takes goods but has not paid.\nThe customer owes your business money.',
                    'SUPPLIER DEBT:\nYour business receives goods from a supplier but has not paid.\nYour business owes the supplier money.',
                    'Example:\nYou sell clothes worth N5,000 to a customer on credit.\nThe customer now owes your business N5,000.',
                    "Record the customer's name, date, amount owed and payment received later.\nThis helps you remember who must pay.",
                    'Another example:\nYou receive stock worth N8,000 from a supplier but agree to pay next week.\nYour business owes the supplier N8,000.',
                    'When a customer pays later, record the payment and reduce the amount they owe.\nWhen you pay a supplier, record the payment and reduce your debt.',
                ],
                question: 'TEST YOURSELF!\nYou sell goods worth N3,000 to Tunde on credit.\nHow much does Tunde owe your business?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '3000',
                successMessage: 'Correct!\nTunde owes your business N3,000.\nThis is money your business expects to receive.',
                failureMessage: 'Remember:\nWhen a customer receives goods but does not pay, the customer owes your business.\nTunde owes N3,000.',
            },
        ],
    },
    // ----------------------------------------------------------
    // MODULE 5: REVIEWING BUSINESS RECORDS AND MAKING DECISIONS
    // ----------------------------------------------------------
    {
        id: 5,
        title: 'Reviewing Business Records and Making Decisions',
        lessons: [
            {
                id: 13,
                module: 5,
                lessonNumber: 1,
                title: 'Organising and Keeping Business Records',
                teachingMessages: [
                    'LESSON 1: Keeping business records.\nA business record is written information about the activities and transactions of a business.',
                    'Important records include:\n1. Sales records\n2. Expense records\n3. Stock records\n4. Cashbook\n5. Customer debts\n6. Supplier debts',
                    'Keep your records organised by date.\nThis makes it easier to find information when you need it.',
                    'Keep receipts, invoices and payment evidence.\nThey help you confirm that transactions really happened.',
                    "Example:\nYou buy goods for N10,000.\nKeep the supplier's receipt and record the purchase in your business records.",
                    'Do not mix personal spending with business spending.\nRecord business transactions separately.\nThis helps you understand how your business is performing.',
                    'Review your records regularly.\nGood records help you avoid mistakes and understand your business.',
                ],
                question: 'TEST YOURSELF!\nYou buy goods for N5,000.\nWhich document should you keep as proof of payment?\nReply with your answer.',
                validate: (a) => normalizeText(a).includes('receipt'),
                successMessage: 'Correct!\nA receipt provides evidence of a purchase or payment.\nKeep it with your business records.',
                failureMessage: 'Not quite.\nYou should keep a receipt as evidence of the purchase or payment.\nTry again.',
            },
            {
                id: 14,
                module: 5,
                lessonNumber: 2,
                title: 'Preparing a Simple Business Summary',
                teachingMessages: [
                    'LESSON 2: Your business summary.\nA business summary shows how your business performed during a period, such as one week.',
                    'At the end of each week, add your total sales.\nThis shows how much your business earned from selling goods or services.',
                    'Next, add your cost of goods sold and other business expenses.\nThese show how much the business spent.',
                    'Example:\nWeekly sales = N20,000\nCost of goods sold = N12,000\nOther expenses = N3,000',
                    'Calculate gross profit:\nN20,000 - N12,000 = N8,000.',
                    'Calculate net profit:\nN8,000 - N3,000 = N5,000.\nYour net profit is N5,000.',
                    'A weekly summary helps you understand whether your business is making a profit or a loss.\nRemember to include only costs and expenses relating to that period.',
                ],
                question: 'TEST YOURSELF!\nWeekly sales: N15,000\nCost of goods sold: N9,000\nOther expenses: N2,000\nWhat is your net profit?\nReply with the amount only.',
                validate: (a) => normalizeAmount(a) === '4000',
                successMessage: 'Excellent!\nGross profit = N15,000 - N9,000 = N6,000.\nNet profit = N6,000 - N2,000 = N4,000.\nYou calculated your net profit correctly.',
                failureMessage: "Let's calculate.\nSales: N15,000\nGoods cost: N9,000\nOther expenses: N2,000\nNet profit = N15,000 - N9,000 - N2,000 = N4,000.",
            },
            {
                id: 15,
                module: 5,
                lessonNumber: 3,
                title: 'Using Bookkeeping to Make Business Decisions',
                teachingMessages: [
                    'LESSON 3: Making better business decisions.\nBookkeeping helps you understand what is happening in your business.',
                    'Your records can show:\nWhich products sell most.\nWhich products sell slowly.\nHow much money you spend.\nWhether your business makes a profit or loss.',
                    'Example:\nYou sell 20 bottles of water but only 3 bottles of juice in one week.\nWater sells faster than juice.',
                    'You may decide to buy more water next week.\nBut always check the cost, selling price and demand before buying more stock.',
                    'If your expenses are too high, review them.\nLook for ways to reduce unnecessary spending without reducing the quality of your products.',
                    'If customers owe you money, follow up on their payments.\nUnpaid customer debts can affect the cash available to run your business.',
                    'Remember:\nGood business decisions should be based on accurate records, not guesses.',
                ],
                question: 'FINAL TEST!\nYour business sells:\n20 bottles of water.\n3 bottles of juice.\nWhich product sold more?\nReply with your answer.',
                validate: (a) => normalizeText(a).includes('water'),
                successMessage: 'Correct! Water sold more.\nYour sales records help you understand which products customers buy most.\nYou have completed the final lesson!',
                failureMessage: 'Not quite.\n20 bottles of water were sold.\nOnly 3 bottles of juice were sold.\nWater sold more.',
            },
        ],
    },
];
// Flat lookup by lesson id
const ALL_LESSONS = MODULES.flatMap((m) => m.lessons);
const DEFAULT_SESSION = {
    state: 'idle',
    moduleId: null,
    lessonId: null,
    teachingIndex: 0,
    questionDelivered: false,
};
// ============================================================
// SESSION STORAGE
// Uses an in-memory map with a DB-backed fallback.
// For production, persist session_data JSON in the users table
// or a dedicated sessions table.
// ============================================================
const sessionCache = new Map();
const getSession = async (userId) => {
    if (sessionCache.has(userId)) {
        return sessionCache.get(userId);
    }
    // Attempt DB load (column must exist; if not, fallback silently)
    try {
        const res = await pool.query('SELECT session_data FROM users WHERE id = $1', [userId]);
        if (res.rows.length && res.rows[0].session_data) {
            const data = { ...DEFAULT_SESSION, ...res.rows[0].session_data };
            sessionCache.set(userId, data);
            return data;
        }
    }
    catch (err) {
        logger.warn('session_data column unavailable; using in-memory session only');
    }
    const fresh = { ...DEFAULT_SESSION };
    sessionCache.set(userId, fresh);
    return fresh;
};
const saveSession = async (userId, session) => {
    sessionCache.set(userId, session);
    try {
        await pool.query('UPDATE users SET session_data = $1 WHERE id = $2', [
            JSON.stringify(session),
            userId,
        ]);
    }
    catch (err) {
        logger.warn('Could not persist session to DB; retained in memory');
    }
};
// ============================================================
// MESSAGE BUILDERS
// ============================================================
const mainMenu = () => 'Welcome to Basic Bookkeeping.\n' +
    'Choose the module you want to study:\n' +
    '1. Recording Money In and Money Out\n' +
    '2. Understanding Sales, Costs and Profit\n' +
    '3. Practical Bookkeeping\n' +
    '4. Managing Stock and Credit\n' +
    '5. Reviewing Business Records\n\n' +
    'Reply with 1-5.';
const moduleMenu = (moduleId) => {
    const mod = MODULES.find((m) => m.id === moduleId);
    return (`MODULE ${mod.id}: ${mod.title.toUpperCase()}\n\n` +
        'You have 3 lessons.\n\n' +
        'Reply:\n' +
        '1. Start Lesson 1\n' +
        '2. Start Lesson 2\n' +
        '3. Start Lesson 3\n' +
        '4. Module Overview\n' +
        '5. Main Menu');
};
const moduleOverview = (moduleId) => {
    const mod = MODULES.find((m) => m.id === moduleId);
    const lessons = mod.lessons
        .map((l) => `Lesson ${l.lessonNumber}: ${l.title}`)
        .join('\n');
    return `MODULE ${mod.id}: ${mod.title.toUpperCase()}\n\nIn this module, you will learn:\n${lessons}\n\nReply 1-3 to start a lesson or 0 for Main Menu.`;
};
const completionMenu = () => 'CONGRATULATIONS!\nYou have completed the Basic Bookkeeping Course!\n\n' +
    'You have learned how to:\n' +
    '1. Record money received and spent.\n' +
    '2. Calculate sales, costs and profit.\n' +
    '3. Manage daily business transactions.\n' +
    '4. Record stock and credit.\n' +
    '5. Review business records and make decisions.\n\n' +
    'You are now ready to apply basic bookkeeping in a small business.\n\n' +
    'Reply:\n' +
    'PROGRESS - View your progress\n' +
    'MENU - Return to main menu\n' +
    'FINISH - End session';
// ============================================================
// PROGRESS HELPERS
// ============================================================
const getCompletedLessonIds = async (userId) => {
    const res = await pool.query("SELECT lesson_id FROM user_progress WHERE user_id = $1 AND status = 'completed'", [userId]);
    return new Set(res.rows.map((r) => Number(r.lesson_id)));
};
const markLessonComplete = async (userId, lessonId) => {
    await pool.query(`INSERT INTO user_progress (user_id, lesson_id, status, completed_at)
     VALUES ($1, $2, 'completed', NOW())
     ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', completed_at = NOW()`, [userId, lessonId]);
};
// ============================================================
// LESSON DELIVERY
// ============================================================
/**
 * Sends the next teaching message for the given lesson.
 * When teaching messages are exhausted, sends the question.
 * Returns the messages that were sent (for logging / tests).
 */
const deliverNextLessonSMS = async (phoneNumber, session, lesson) => {
    const sent = [];
    if (session.teachingIndex < lesson.teachingMessages.length) {
        const msg = lesson.teachingMessages[session.teachingIndex];
        // Append the NEXT prompt so the user knows how to advance
        const withHint = `${msg}\n\nType NEXT to continue.`;
        await sendSMS(phoneNumber, withHint);
        sent.push(withHint);
        session.teachingIndex += 1;
        session.state = 'lesson_teaching';
        return { session, sent };
    }
    if (!session.questionDelivered) {
        await sendSMS(phoneNumber, lesson.question);
        sent.push(lesson.question);
        session.questionDelivered = true;
        session.state = 'awaiting_answer';
        return { session, sent };
    }
    // Safety re-send of the question
    await sendSMS(phoneNumber, lesson.question);
    sent.push(lesson.question);
    session.state = 'awaiting_answer';
    return { session, sent };
};
// ============================================================
// MAIN CONTROLLER
// ============================================================
export const handleSMS = async (req, res) => {
    logger.info('Incoming SMS webhook body:', req.body);
    const phoneNumber = req.body.from || '+2348012345678';
    const rawText = req.body.text || '';
    const sessionId = req.body.sessionId || req.body.id;
    if (!phoneNumber) {
        logger.error('Phone number (from) is missing from webhook payload');
        res.status(400).send('Missing phone number');
        return;
    }
    try {
        // 1. Ensure user exists (auto-registration)
        let userResult = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
        let userId;
        if (userResult.rows.length === 0) {
            const newUserResult = await pool.query('INSERT INTO users (phone_number) VALUES ($1) RETURNING id', [phoneNumber]);
            userId = newUserResult.rows[0].id;
        }
        else {
            userId = userResult.rows[0].id;
        }
        const completed = await getCompletedLessonIds(userId);
        const completedCount = completed.size;
        const totalLessons = ALL_LESSONS.length;
        const text = rawText.trim();
        const upper = text.toUpperCase();
        // 2. Load session
        let session = await getSession(userId);
        let replyMessage = '';
        // 3. Global commands available at any time
        if (upper === '' || upper === 'MENU' || upper === 'BOOK') {
            session = { ...DEFAULT_SESSION };
            replyMessage = mainMenu();
        }
        else if (upper === 'HELP') {
            replyMessage =
                'Basic Bookkeeping Help:\n' +
                    '- Text MENU to see the main menu.\n' +
                    '- Text NEXT to move to the next page while reading a lesson.\n' +
                    '- Answer practice questions with numbers or short words.\n' +
                    '- All financial examples use Nigerian Naira (N).\n' +
                    '- Text PROGRESS to view your progress.';
        }
        else if (upper === 'PROGRESS') {
            replyMessage =
                `You have completed ${completedCount} out of ${totalLessons} lessons.\n` +
                    'Keep learning!\n\nText MENU to choose a module.';
        }
        else if (upper === 'START') {
            // Convenience: route START to main menu if idle, else resume current flow
            if (session.state === 'idle' || session.state === 'selecting_module') {
                session = { ...DEFAULT_SESSION };
                replyMessage = mainMenu();
            }
            else if (session.state === 'module_menu' && session.moduleId) {
                replyMessage = moduleMenu(session.moduleId);
            }
            else if (session.state === 'lesson_teaching' || session.state === 'awaiting_answer') {
                const lesson = ALL_LESSONS.find((l) => l.id === session.lessonId);
                if (lesson) {
                    const { session: s2, sent } = await deliverNextLessonSMS(phoneNumber, session, lesson);
                    session = s2;
                    replyMessage = sent.join('\n\n') || '';
                }
                else {
                    session = { ...DEFAULT_SESSION };
                    replyMessage = mainMenu();
                }
            }
        }
        // 4. State machine
        else if (session.state === 'idle' || session.state === 'selecting_module') {
            const choice = normalizeAmount(text);
            const moduleId = parseInt(choice, 10);
            if ([1, 2, 3, 4, 5].includes(moduleId)) {
                session.state = 'module_menu';
                session.moduleId = moduleId;
                session.lessonId = null;
                session.teachingIndex = 0;
                session.questionDelivered = false;
                replyMessage = moduleMenu(moduleId);
            }
            else {
                replyMessage = mainMenu();
            }
        }
        else if (session.state === 'module_menu' && session.moduleId) {
            const moduleId = session.moduleId;
            const mod = MODULES.find((m) => m.id === moduleId);
            const choice = normalizeAmount(text);
            if (choice === '0' || upper === 'MENU') {
                session = { ...DEFAULT_SESSION };
                replyMessage = mainMenu();
            }
            else if (choice === '4') {
                replyMessage = moduleOverview(moduleId);
            }
            else if (choice === '5') {
                session = { ...DEFAULT_SESSION };
                replyMessage = mainMenu();
            }
            else if (['1', '2', '3'].includes(choice)) {
                const lesson = mod.lessons[parseInt(choice, 10) - 1];
                if (!lesson) {
                    replyMessage = moduleMenu(moduleId);
                }
                else {
                    // Begin lesson delivery: send first teaching SMS immediately
                    session = {
                        state: 'lesson_teaching',
                        moduleId,
                        lessonId: lesson.id,
                        teachingIndex: 0,
                        questionDelivered: false,
                    };
                    const { session: s2, sent } = await deliverNextLessonSMS(phoneNumber, session, lesson);
                    session = s2;
                    replyMessage = sent.join('\n\n') || ''; // SMS already sent
                }
            }
            else {
                replyMessage = moduleMenu(moduleId);
            }
        }
        else if (session.state === 'lesson_teaching' && session.lessonId) {
            const lesson = ALL_LESSONS.find((l) => l.id === session.lessonId);
            if (upper !== 'NEXT') {
                // Not a NEXT command — re-show the current teaching message + hint
                const currentIndex = Math.max(0, session.teachingIndex - 1);
                const currentMsg = lesson.teachingMessages[currentIndex];
                replyMessage =
                    currentMsg +
                        '\n\nType NEXT to continue.' +
                        '\n(Type MENU to return to the main menu.)';
            }
            else {
                // User typed NEXT — deliver the next teaching SMS
                const { session: s2, sent } = await deliverNextLessonSMS(phoneNumber, session, lesson);
                session = s2;
                replyMessage = sent.join('\n\n') || '';
            }
        }
        else if (session.state === 'awaiting_answer' && session.lessonId) {
            const lesson = ALL_LESSONS.find((l) => l.id === session.lessonId);
            const isCorrect = lesson.validate(text);
            if (isCorrect) {
                await markLessonComplete(userId, lesson.id);
                completed.add(lesson.id);
                const mod = MODULES.find((m) => m.id === lesson.module);
                const isLastInModule = lesson.lessonNumber === mod.lessons.length;
                const isLastInCourse = lesson.id === ALL_LESSONS[ALL_LESSONS.length - 1].id;
                if (isLastInCourse) {
                    session = { ...DEFAULT_SESSION };
                    replyMessage = lesson.successMessage + '\n\n' + completionMenu();
                }
                else if (isLastInModule) {
                    session = { ...DEFAULT_SESSION };
                    replyMessage =
                        lesson.successMessage +
                            `\n\nReply:\n` +
                            `START - Start next module\n` +
                            `REVIEW - Review this module\n` +
                            `MENU - Main Menu`;
                }
                else {
                    const nextLesson = mod.lessons[lesson.lessonNumber];
                    session = {
                        state: 'lesson_teaching',
                        moduleId: mod.id,
                        lessonId: nextLesson.id,
                        teachingIndex: 0,
                        questionDelivered: false,
                    };
                    replyMessage =
                        lesson.successMessage +
                            `\n\nText START to receive Lesson ${lesson.lessonNumber + 1}, or reply MENU.`;
                }
            }
            else {
                replyMessage = lesson.failureMessage + '\n\nReply with your answer again, or text HELP.';
            }
        }
        else {
            // Unknown state - reset
            session = { ...DEFAULT_SESSION };
            replyMessage = mainMenu();
        }
        // 5. Send reply if we built one
        if (replyMessage) {
            await sendSMS(phoneNumber, replyMessage);
        }
        // 6. Persist session
        await saveSession(userId, session);
        res.status(200).send(replyMessage || 'OK');
    }
    catch (error) {
        logger.error('Error processing incoming SMS', {
            message: error?.message,
            stack: error?.stack,
            sessionId,
            phoneNumber,
        });
        res.status(500).send('Internal Server Error');
    }
};
// ============================================================
// EXPORTS FOR TESTING
// ============================================================
export const __testables = {
    MODULES,
    ALL_LESSONS,
    mainMenu,
    moduleMenu,
    moduleOverview,
    getSession,
    saveSession,
    DEFAULT_SESSION,
};
