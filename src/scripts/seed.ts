// src/scripts/seed.ts
import { db } from '$lib/db';
import dayjs from 'dayjs';

const rows = [
  // KOPANIARZ (sample)
  { driver: 'KOPANIARZ', month: '2025-06-01', frachty: 3128.87, paliwo: 0, razem: 3128.87, wynagr: 4572.2, wynik_mc: -1443.33, wynik_narast: -1443.33 },
  { driver: 'KOPANIARZ', month: '2025-07-01', frachty: 12491.26, paliwo: 433.44, razem: 12924.7, wynagr: 16708.96, wynik_mc: -3784.26, wynik_narast: -5227.59 },
  { driver: 'KOPANIARZ', month: '2025-08-01', frachty: 10260.04, paliwo: 1245.95, razem: 11505.99, wynagr: 14308.86, wynik_mc: -2802.87, wynik_narast: -8030.46 },

  // KRYVAK (sample)
  { driver: 'KRYVAK', month: '2024-09-01', frachty: 23081.65, paliwo: 775.52, razem: 23857.17, wynagr: 25317.67, wynik_mc: -1460.5, wynik_narast: -1128.07 },
  { driver: 'KRYVAK', month: '2024-10-01', frachty: 11892.95, paliwo: 1758.26, razem: 13651.21, wynagr: 12508.98, wynik_mc: 1142.23, wynik_narast: 787.95 },
  { driver: 'KRYVAK', month: '2024-11-01', frachty: 10179.36, paliwo: 1201.55, razem: 11380.91, wynagr: 10481.07, wynik_mc: 899.84, wynik_narast: 877.79 },

  // KUBYSHKIN (sample)
  { driver: 'KUBYSHKIN', month: '2024-11-01', frachty: 10444.85, paliwo: 752.59, razem: 11197.44, wynagr: 10395.66, wynik_mc: 801.78, wynik_narast: 801.78 },
  { driver: 'KUBYSHKIN', month: '2025-01-01', frachty: 12215.29, paliwo: 773.72, razem: 12989.71, wynagr: 12162.72, wynik_mc: 826.99, wynik_narast: 2520.69 }
];

db.prepare(`DELETE FROM entries`).run();
const insert = db.prepare(`
  INSERT INTO entries (driver, month, frachty, paliwo, razem, wynagr, wynik_mc, wynik_narast)
  VALUES (@driver, @month, @frachty, @paliwo, @razem, @wynagr, @wynik_mc, @wynik_narast)
`);
const tx = db.transaction((items: any[]) => {
  for (const it of items) insert.run(it);
});
tx(rows);

console.log(`Seeded ${rows.length} rows at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);

