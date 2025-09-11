import { Pool } from 'pg';
import { env } from '$env/dynamic/private';

const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
console.log(connectionString);
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Define it in your env (e.g., .env).');
}

const pool = new Pool({
  connectionString,
  // Enable SSL by default for remote DBs (e.g., Supabase). Disable for localhost.
  ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? undefined : { rejectUnauthorized: false }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool };

// Provide a default export for compatibility with code using `import db from ...` and calling db.query
const db = { query };
export default db;
