// src/lib/db.ts
import { browser } from '$app/environment';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db = null;
let isInitialized = false;

export async function getDb() {
    if (browser) {
        throw new Error('Database operations are not available in the browser');
    }

    if (!db) {
        try {
            console.log('Initializing FRANCEPOL database connection...');
            
            let dbPath;
            
            // Check if we're in production environment
            const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT;
            
            if (isProduction) {
                dbPath = "/shared/volumes/a24e25/main.db";
                // Check if the directory exists, if not create it
                const dbDir = path.dirname(dbPath);
                if (!fs.existsSync(dbDir)) {
                    try {
                        fs.mkdirSync(dbDir, { recursive: true });
                        console.log(`Created directory: ${dbDir}`);
                    } catch (dirError) {
                        console.error(`Error creating directory ${dbDir}:`, dirError);
                    }
                }
                
                // Check if existing db file is corrupted or has schema issues
                const dbFileExists = fs.existsSync(dbPath);
                if (dbFileExists) {
                    try {
                        // Try to open and validate the database
                        const testDb = new Database(dbPath);
                        try {
                            // Try to query the entries table to verify schema
                            testDb.prepare('SELECT driver FROM entries LIMIT 1').get();
                        } catch (schemaError) {
                            console.warn('Schema validation failed, recreating database:', schemaError.message);
                            testDb.close();
                            fs.renameSync(dbPath, `${dbPath}.backup-${Date.now()}`);
                            console.log('Renamed old database file to backup');
                        }
                        testDb.close();
                    } catch (openError) {
                        console.warn('Failed to open existing database, will recreate:', openError.message);
                        try {
                            fs.renameSync(dbPath, `${dbPath}.corrupt-${Date.now()}`);
                            console.log('Renamed corrupted database file');
                        } catch (renameError) {
                            console.error('Error renaming corrupted database file:', renameError);
                        }
                    }
                }
                
                db = new Database(dbPath);
            } else {
                dbPath = ".data/transport.sqlite";
                // Ensure directory exists for development
                const dbDir = path.dirname(dbPath);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }
                db = new Database(dbPath);
            }

            db.pragma('foreign_keys = ON');
            
            // Initialize schema
            console.log('Setting up FRANCEPOL database schema...');
            initializeSchema(db);
            
            // Import CSV data if available
            try {
                const { importCsvData } = await import('./import-csv');
                console.log('Importing CSV data...');
                await importCsvData(db);
            } catch (error) {
                console.error('Error importing CSV data (non-fatal):', error.message);
            }
            
            // Verify entries table creation
            try {
                const entriesCount = db.prepare('SELECT COUNT(*) as count FROM entries').get();
                console.log(`Entries table created successfully. Found ${entriesCount.count} entries.`);
            } catch (error) {
                console.error('Error verifying entries table:', error);
            }
            
            isInitialized = true;
            console.log('FRANCEPOL database initialization complete!');
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }
    return db;
}

export function closeDb() {
    if (db) {
        db.close();
        db = null;
        isInitialized = false;
        console.log('Database connection closed');
    }
}

export function isDbInitialized() {
    return isInitialized;
}

function initializeSchema(database) {
    database.exec(`
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

export async function listDrivers(): Promise<string[]> {
  try {
    const database = await getDb();
    const rows = database.prepare(`SELECT DISTINCT driver FROM entries ORDER BY driver`).all();
    return rows.map((r: any) => r.driver);
  } catch (error) {
    console.error('Error listing drivers:', error);
    return [];
  }
}

export async function allEntries(): Promise<Entry[]> {
  try {
    const database = await getDb();
    return database.prepare(`SELECT * FROM entries ORDER BY month, driver`).all() as Entry[];
  } catch (error) {
    console.error('Error fetching all entries:', error);
    return [];
  }
}

export async function entriesByDriver(driver: string): Promise<Entry[]> {
  try {
    const database = await getDb();
    return database.prepare(`SELECT * FROM entries WHERE driver = ? ORDER BY month`).all(driver) as Entry[];
  } catch (error) {
    console.error('Error fetching entries for driver:', driver, error);
    return [];
  }
}

export async function monthlyTotalsForDrivers(drivers: string[]): Promise<Entry[]> {
  if (drivers.length === 0) return [];
  try {
    const database = await getDb();
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

