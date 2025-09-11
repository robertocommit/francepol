// src/lib/db.ts
import db from '$lib/server/db';

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

// Initialize the driver_financials table if it doesn't exist
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS driver_financials (
      id SERIAL PRIMARY KEY,
      driver TEXT NOT NULL,
      month DATE NOT NULL,
      frachty DECIMAL(10,2) NOT NULL DEFAULT 0,   -- FRACHTY-fra
      paliwo DECIMAL(10,2) NOT NULL DEFAULT 0,    -- PALIWO
      razem DECIMAL(10,2) NOT NULL DEFAULT 0,     -- RAZEM
      wynagr DECIMAL(10,2) NOT NULL DEFAULT 0,    -- WYNAGR.
      wynik_mc DECIMAL(10,2) NOT NULL DEFAULT 0,  -- WYNIK mc
      wynik_narast DECIMAL(10,2) NOT NULL DEFAULT 0, -- wynik narast.
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(driver, month)
    );
    CREATE INDEX IF NOT EXISTS idx_driver_financials_driver_month ON driver_financials(driver, month);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_driver_financials_driver_month ON driver_financials(driver, month);
  `);
}

export async function listDrivers(): Promise<string[]> {
  try {
    await ensureTable();
    const result = await db.query(`SELECT DISTINCT driver FROM driver_financials ORDER BY driver`);
    return result.rows.map((r: any) => r.driver);
  } catch (error) {
    console.error('Error listing drivers:', error);
    return [];
  }
}

export async function allEntries(): Promise<Entry[]> {
  try {
    await ensureTable();
    const result = await db.query(`
      SELECT 
        id, driver, 
        to_char(month, 'YYYY-MM-DD') as month,
        frachty::float8, paliwo::float8, razem::float8, 
        wynagr::float8, wynik_mc::float8, wynik_narast::float8
      FROM driver_financials 
      ORDER BY month, driver
    `);
    return result.rows as Entry[];
  } catch (error) {
    console.error('Error fetching all entries:', error);
    return [];
  }
}

export async function entriesByDriver(driver: string): Promise<Entry[]> {
  try {
    await ensureTable();
    const result = await db.query(`
      SELECT 
        id, driver, 
        to_char(month, 'YYYY-MM-DD') as month,
        frachty::float8, paliwo::float8, razem::float8, 
        wynagr::float8, wynik_mc::float8, wynik_narast::float8
      FROM driver_financials 
      WHERE driver = $1 
      ORDER BY month
    `, [driver]);
    return result.rows as Entry[];
  } catch (error) {
    console.error('Error fetching entries for driver:', driver, error);
    return [];
  }
}

export async function monthlyTotalsForDrivers(drivers: string[]): Promise<Entry[]> {
  if (drivers.length === 0) return [];
  try {
    await ensureTable();
    const result = await db.query(`
      SELECT
        0 as id,
        'TOTAL' as driver,
        to_char(month, 'YYYY-MM-DD') as month,
        SUM(frachty)::float8 as frachty,
        SUM(paliwo)::float8 as paliwo,
        SUM(razem)::float8 as razem,
        SUM(wynagr)::float8 as wynagr,
        SUM(wynik_mc)::float8 as wynik_mc,
        SUM(wynik_narast)::float8 as wynik_narast
      FROM driver_financials
      WHERE driver = ANY($1::text[])
      GROUP BY month
      ORDER BY month
    `, [drivers]);
    return result.rows as Entry[];
  } catch (error) {
    console.error('Error calculating monthly totals:', error);
    return [];
  }
}

export type UpsertEntryInput = {
  driver: string;
  month: string; // YYYY-MM-DD
  frachty: number;
  paliwo: number;
  razem: number;
  wynagr: number;
  wynik_mc: number;
  wynik_narast: number;
};

export async function upsertEntry(input: UpsertEntryInput): Promise<Entry | null> {
  try {
    await ensureTable();
    const result = await db.query(
      `INSERT INTO driver_financials
        (driver, month, frachty, paliwo, razem, wynagr, wynik_mc, wynik_narast)
       VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (driver, month) DO UPDATE SET
        frachty = EXCLUDED.frachty,
        paliwo = EXCLUDED.paliwo,
        razem = EXCLUDED.razem,
        wynagr = EXCLUDED.wynagr,
        wynik_mc = EXCLUDED.wynik_mc,
        wynik_narast = EXCLUDED.wynik_narast
       RETURNING id, driver, to_char(month, 'YYYY-MM-DD') as month,
         frachty::float8, paliwo::float8, razem::float8, wynagr::float8, wynik_mc::float8, wynik_narast::float8`,
      [
        input.driver,
        input.month,
        input.frachty,
        input.paliwo,
        input.razem,
        input.wynagr,
        input.wynik_mc,
        input.wynik_narast
      ]
    );
    return (result.rows[0] as Entry) ?? null;
  } catch (error) {
    console.error('Error upserting entry:', error);
    return null;
  }
}

export async function deleteEntry(driver: string, month: string): Promise<number> {
  try {
    await ensureTable();
    const result = await db.query(
      `DELETE FROM driver_financials WHERE driver = $1 AND month = $2::date`,
      [driver, month]
    );
    // result.rowCount is not available in some pg configs when using pool.query typings, so coalesce
    return (result as any).rowCount ?? 0;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return 0;
  }
}

export async function deleteDriver(driver: string): Promise<number> {
  try {
    await ensureTable();
    const result = await db.query(
      `DELETE FROM driver_financials WHERE driver = $1`,
      [driver]
    );
    return (result as any).rowCount ?? 0;
  } catch (error) {
    console.error('Error deleting driver:', error);
    return 0;
  }
}

