// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { listDrivers, monthlyTotalsForDrivers } from '$lib/db';

export const load: PageServerLoad = async ({ url }) => {
  const selectedDrivers = url.searchParams.getAll('driver');

  // Fetch drivers list and monthly totals
  const drivers = await listDrivers();
  const effectiveSelection = selectedDrivers.length === 0 ? drivers : selectedDrivers;
  const totals = await monthlyTotalsForDrivers(effectiveSelection);

  return {
    drivers,
    selectedDrivers,
    totals
  };
};

