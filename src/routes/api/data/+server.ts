// src/routes/api/data/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { allEntries, listDrivers, entriesByDriver, monthlyTotalsForDrivers, upsertEntry, deleteEntry, deleteDriver } from '$lib/db';

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

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { driver, month, frachty, paliwo, razem, wynagr, wynik_mc, wynik_narast } = body ?? {};
    if (!driver || !month) {
      return new Response(JSON.stringify({ error: 'driver and month are required' }), { status: 400 });
    }
    const entry = await upsertEntry({ driver, month, frachty: Number(frachty) || 0, paliwo: Number(paliwo) || 0, razem: Number(razem) || 0, wynagr: Number(wynagr) || 0, wynik_mc: Number(wynik_mc) || 0, wynik_narast: Number(wynik_narast) || 0 });
    return new Response(JSON.stringify({ entry }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to upsert entry' }), { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, request }) => {
  try {
    // Support query params for quick deletion
    const driverParam = url.searchParams.get('driver');
    const monthParam = url.searchParams.get('month');
    const allParam = url.searchParams.get('all');

    if (driverParam && allParam === 'true') {
      const deleted = await deleteDriver(driverParam);
      return new Response(JSON.stringify({ deleted }), { headers: { 'content-type': 'application/json' } });
    }

    if (driverParam && monthParam) {
      const deleted = await deleteEntry(driverParam, monthParam);
      return new Response(JSON.stringify({ deleted }), { headers: { 'content-type': 'application/json' } });
    }

    // Or JSON body variant
    const body = await request.json().catch(() => null);
    if (body?.driver && body?.all === true) {
      const deleted = await deleteDriver(body.driver);
      return new Response(JSON.stringify({ deleted }), { headers: { 'content-type': 'application/json' } });
    }
    if (body?.driver && body?.month) {
      const deleted = await deleteEntry(body.driver, body.month);
      return new Response(JSON.stringify({ deleted }), { headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Provide driver+month or driver+all=true' }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
};

