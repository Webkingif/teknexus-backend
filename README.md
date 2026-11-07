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
   git clone https://github.com/Webkingif/teknexus-backend.git
   cd teknexus-backend
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
