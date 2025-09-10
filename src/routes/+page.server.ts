// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { listDrivers, monthlyTotalsForDrivers } from '$lib/db';

export const load: PageServerLoad = async ({ url }) => {
  const selected = url.searchParams.getAll('driver');
  const drivers = await listDrivers();
  const selectedDrivers = selected.length ? selected : drivers.slice(0, Math.min(5, drivers.length));
  const totals = await monthlyTotalsForDrivers(selectedDrivers);
  return { drivers, selectedDrivers, totals };
};

