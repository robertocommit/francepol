import { Pool } from 'pg';
import { env } from '$env/dynamic/private';

const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;


import { resolve4, resolve6, lookup } from 'node:dns/promises';
const host = new URL(process.env.DATABASE_URL).hostname;
console.log('DB HOST:', host);
try { console.log('A records:', await resolve4(host)); } catch (e) { console.log('resolve4 fail', e.code); }
try { console.log('AAAA records:', await resolve6(host)); } catch (e) { console.log('resolve6 fail', e.code); }
try { console.log('lookup:', await lookup(host, { all: true })); } catch (e) { console.log('lookup fail', e.code); }


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
