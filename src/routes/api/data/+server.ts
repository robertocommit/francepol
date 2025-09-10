// src/routes/api/data/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { allEntries, listDrivers, entriesByDriver, monthlyTotalsForDrivers } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
  const driver = url.searchParams.get('driver');
  const drivers = url.searchParams.getAll('drivers');

  if (driver) {
    const entries = await entriesByDriver(driver);
    return new Response(JSON.stringify({ entries }), { headers: { 'content-type': 'application/json' } });
  }
  if (drivers.length > 0) {
    const totals = await monthlyTotalsForDrivers(drivers);
    return new Response(JSON.stringify({ totals }), { headers: { 'content-type': 'application/json' } });
  }
  const [allDrivers, allEntriesData] = await Promise.all([listDrivers(), allEntries()]);
  return new Response(JSON.stringify({ drivers: allDrivers, entries: allEntriesData }), { headers: { 'content-type': 'application/json' } });
};

