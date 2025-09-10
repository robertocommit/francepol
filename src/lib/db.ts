// src/lib/db.ts
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.resolve('.data');
const DB_PATH = path.join(DB_DIR, 'transport.sqlite');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new Database(DB_PATH);

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
  const rows = db.prepare(`SELECT DISTINCT driver FROM entries ORDER BY driver`).all();
  return rows.map((r: any) => r.driver);
}

export function allEntries(): Entry[] {
  return db.prepare(`SELECT * FROM entries ORDER BY month, driver`).all() as Entry[];
}

export function entriesByDriver(driver: string): Entry[] {
  return db.prepare(`SELECT * FROM entries WHERE driver = ? ORDER BY month`).all(driver) as Entry[];
}

export function monthlyTotalsForDrivers(drivers: string[]): Entry[] {
  if (drivers.length === 0) return [];
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
}

