// src/lib/db.ts
import fs from 'node:fs';
import path from 'node:path';

// Try to import better-sqlite3, but handle cases where it's not available
let Database: any;
try {
  Database = require('better-sqlite3');
} catch (error) {
  console.warn('better-sqlite3 not available, using fallback');
  Database = null;
}

const DB_DIR = path.resolve('.data');
const DB_PATH = path.join(DB_DIR, 'transport.sqlite');

// Lazy database initialization
let db: any = null;
let isInitialized = false;

function initializeDatabase(): any {
  if (db && isInitialized) {
    return db;
  }

  // Check if we're in a build environment or if better-sqlite3 is not available
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.RUNTIME;
  const isSSRBuild = typeof window === 'undefined' && process.env.VITE_BUILD;
  
  if (isBuildTime || isSSRBuild || !Database) {
    // During build time or if Database is not available, return null
    console.log('Build time detected or Database not available, skipping database initialization');
    return null;
  }

  try {
    // Ensure directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = new Database(DB_PATH);
    console.log('Database initialized successfully');
    
    // Initialize schema
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
    
    isInitialized = true;
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fallback: try to create a new database
    try {
      db = new Database(':memory:'); // Use in-memory database as fallback
      console.log('Using in-memory database as fallback');
      
      // Initialize schema for in-memory database
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
      
      isInitialized = true;
      return db;
    } catch (fallbackError) {
      console.error('Failed to create fallback database:', fallbackError);
      throw new Error('Database initialization failed');
    }
  }
}

export { initializeDatabase as db };


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
    const database = initializeDatabase();
    if (!database) return [];
    const rows = database.prepare(`SELECT DISTINCT driver FROM entries ORDER BY driver`).all();
    return rows.map((r: any) => r.driver);
  } catch (error) {
    console.error('Error listing drivers:', error);
    return [];
  }
}

export function allEntries(): Entry[] {
  try {
    const database = initializeDatabase();
    if (!database) return [];
    return database.prepare(`SELECT * FROM entries ORDER BY month, driver`).all() as Entry[];
  } catch (error) {
    console.error('Error fetching all entries:', error);
    return [];
  }
}

export function entriesByDriver(driver: string): Entry[] {
  try {
    const database = initializeDatabase();
    if (!database) return [];
    return database.prepare(`SELECT * FROM entries WHERE driver = ? ORDER BY month`).all(driver) as Entry[];
  } catch (error) {
    console.error('Error fetching entries for driver:', driver, error);
    return [];
  }
}

export function monthlyTotalsForDrivers(drivers: string[]): Entry[] {
  if (drivers.length === 0) return [];
  try {
    const database = initializeDatabase();
    if (!database) return [];
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
    return database.prepare(sql).all(...drivers) as Entry[];
  } catch (error) {
    console.error('Error calculating monthly totals:', error);
    return [];
  }
}

