// src/routes/api/data/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { allEntries, listDrivers, entriesByDriver, monthlyTotalsForDrivers } from '$lib/db';

export const GET: RequestHandler = ({ url }) => {
  const driver = url.searchParams.get('driver');
  const drivers = url.searchParams.getAll('drivers');

  if (driver) {
    return new Response(JSON.stringify({ entries: entriesByDriver(driver) }), { headers: { 'content-type': 'application/json' } });
  }
  if (drivers.length > 0) {
    return new Response(JSON.stringify({ totals: monthlyTotalsForDrivers(drivers) }), { headers: { 'content-type': 'application/json' } });
  }
  return new Response(JSON.stringify({ drivers: listDrivers(), entries: allEntries() }), { headers: { 'content-type': 'application/json' } });
};

