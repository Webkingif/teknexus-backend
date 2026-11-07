# 📚 Basic Bookkeeping SMS Vocational Course Bot

An interactive, automated SMS-based vocational learning platform designed to deliver bite-sized bookkeeping lessons, track user progress, and evaluate answers in real-time. Built with Node.js, Express, Supabase, and the Africa's Talking SMS API.

## 🚀 Features

- **Automated User Onboarding:** Automatically registers new phone numbers when they text keywords like `START` or `BOOK`.
- **Stateful Lesson Progression:** Tracks individual student progress through a structured curriculum stored securely in Supabase.
- **Interactive Answer Evaluation:** Evaluates student submissions (e.g., numerical answers, calculations) and provides instant pedagogical feedback.
- **Dual Testing Workflow:** Supports both the Africa's Talking Sandbox Environment and a custom Local Web Chat Simulator for rapid development.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript/JavaScript
- **Database & Auth:** Supabase (PostgreSQL)
- **Messaging Gateway:** Africa's Talking SDK (`africastalking`)
- **Environment Management:** `dotenv`

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18+ recommended)
- npm or yarn
- An active Supabase project
- An Africa's Talking account (Sandbox or Live)

## 📂 Project Structure

```text
├── src/
│   ├── controllers/   # SMS webhook handlers & curriculum logic
│   ├── models/        # Database queries & Supabase integrations
│   ├── routes/        # Express route definitions
│   └── server.ts      # Main application entry point
├── chat-simulator.html # Local web chat UI for rapid testing
├── package.json
└── .env
```

## 📝 Getting Started & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/basic-bookkeeping-sms-bot.git
   cd basic-bookkeeping-sms-bot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add your configuration credentials:

   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   AT_USERNAME=sandbox
   AT_API_KEY=your_africastalking_sandbox_api_key
   ```

4. **Run the Server:**

   - For development (with hot-reloading):

     ```bash
     npm run dev
     ```

   - For production:

     ```bash
     npm start
     ```

## 🧪 Testing the Bot

### Option A: Using the Local Chat Simulator

1. Open the included `chat-simulator.html` file in any web browser.
2. Ensure your backend server is running locally on port `3000` (or via your active GitHub Codespace public URL).
3. Type keywords like `BOOK`, `START`, `PROGRESS`, or `HELP` to interact with the course curriculum in real time.

### Option B: Using the Africa's Talking Sandbox

1. Configure your local backend tunnel (e.g., via ngrok or GitHub Codespaces public port).
2. Set your webhook URL in the Africa's Talking Sandbox Dashboard under SMS Callback URLs (e.g., `https://your-domain.app/sms`).
3. Use the Africa's Talking Web Simulator to send test triggers. Note: Ensure your code uses `from: 'Sandbox'` during sandbox testing to prevent shortcode lookup failures.

## 📄 License

This project is licensed under the MIT License.
