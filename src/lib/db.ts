// src/lib/db.ts
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.resolve('.data');
const DB_PATH = path.join(DB_DIR, 'transport.sqlite');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create database directory:', error);
  }
}

// Initialize database with error handling
let db: Database.Database;
try {
  db = new Database(DB_PATH);
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  // Fallback: try to create a new database
  try {
    db = new Database(':memory:'); // Use in-memory database as fallback
    console.log('Using in-memory database as fallback');
  } catch (fallbackError) {
    console.error('Failed to create fallback database:', fallbackError);
    throw new Error('Database initialization failed');
  }
}

export { db };

// Initialize database schema with error handling
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver TEXT NOT NULL,
      month TEXT NOT NULL,               -- YYYY-MM-01
      frachty REAL NOT NULL DEFAULT 0,   -- FRACHTY-fra
      paliwo REAL NOT NULL DEFAULT 0,    -- PALIWO
      razem REAL NOT NULL DEFAULT 0,     -- RAZEM
      wynagr REAL NOT NULL DEFAULT 0,    -- WYNAGR.
      wynik_mc REAL NOT NULL DEFAULT 0,  -- WYNIK mc
      wynik_narast REAL NOT NULL DEFAULT 0 -- wynik narast.
    );

    CREATE INDEX IF NOT EXISTS idx_entries_driver_month ON entries(driver, month);
  `);
  console.log('Database schema initialized successfully');
} catch (error) {
  console.error('Failed to initialize database schema:', error);
}

export type Entry = {
  id: number;
  driver: string;
  month: string;
  frachty: number;
  paliwo: number;
  razem: number;
  wynagr: number;
  wynik_mc: number;
  wynik_narast: number;
};

export function listDrivers(): string[] {
  try {
    const rows = db.prepare(`SELECT DISTINCT driver FROM entries ORDER BY driver`).all();
    return rows.map((r: any) => r.driver);
  } catch (error) {
    console.error('Error listing drivers:', error);
    return [];
  }
}

export function allEntries(): Entry[] {
  try {
    return db.prepare(`SELECT * FROM entries ORDER BY month, driver`).all() as Entry[];
  } catch (error) {
    console.error('Error fetching all entries:', error);
    return [];
  }
}

export function entriesByDriver(driver: string): Entry[] {
  try {
    return db.prepare(`SELECT * FROM entries WHERE driver = ? ORDER BY month`).all(driver) as Entry[];
  } catch (error) {
    console.error('Error fetching entries for driver:', driver, error);
    return [];
  }
}

export function monthlyTotalsForDrivers(drivers: string[]): Entry[] {
  if (drivers.length === 0) return [];
  try {
    const placeholders = drivers.map(() => '?').join(',');
    const sql = `
      SELECT
        'TOTAL' as driver,
        month,
        SUM(frachty) as frachty,
        SUM(paliwo)  as paliwo,
        SUM(razem)   as razem,
        SUM(wynagr)  as wynagr,
        SUM(wynik_mc) as wynik_mc,
        SUM(wynik_narast) as wynik_narast
      FROM entries
      WHERE driver IN (${placeholders})
      GROUP BY month
      ORDER BY month
    `;
    return db.prepare(sql).all(...drivers) as Entry[];
  } catch (error) {
    console.error('Error calculating monthly totals:', error);
    return [];
  }
}

