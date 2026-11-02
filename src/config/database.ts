import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log(connectionString)
if (!connectionString) {
  console.error('❌ FATAL ERROR: DATABASE_URL is missing from environment variables or .env file!');
} else {
  // Extract and print just the host domain safely for debugging
  try {
    const parsedUrl = new URL(connectionString);
    console.log('✅ Connecting to database host:', parsedUrl.hostname);
  } catch (e) {
    console.log('✅ Connecting using connection string.');
  }
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('🔗 Connected to Supabase PostgreSQL database successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
  process.exit(-1);
});