import { query } from './db';

export type Driver = { id: number; name: string };

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'drivers_set_updated_at'
      ) THEN
        CREATE TRIGGER drivers_set_updated_at
        BEFORE UPDATE ON drivers
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
      END IF;
    END;
    $$;
  `);
}

export async function listDrivers(): Promise<Driver[]> {
  await ensureTable();
  const { rows } = await query('SELECT id, name FROM drivers ORDER BY name ASC');
  return rows as Driver[];
}

export async function createDriver(name: string): Promise<Driver> {
  await ensureTable();
  const { rows } = await query(
    'INSERT INTO drivers (name) VALUES ($1) RETURNING id, name',
    [name.trim()]
  );
  return rows[0] as Driver;
}

export async function updateDriver(id: number, name: string): Promise<Driver | null> {
  await ensureTable();
  const { rows } = await query(
    'UPDATE drivers SET name = $2 WHERE id = $1 RETURNING id, name',
    [id, name.trim()]
  );
  return (rows[0] as Driver) ?? null;
}

export async function deleteDriver(id: number): Promise<void> {
  await ensureTable();
  await query('DELETE FROM drivers WHERE id = $1', [id]);
}

export async function deleteDrivers(ids: number[]): Promise<number> {
  await ensureTable();
  if (!ids.length) return 0;
  const { rowCount } = await query('DELETE FROM drivers WHERE id = ANY($1::int[])', [ids]);
  return rowCount ?? 0;
}
