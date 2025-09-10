// src/routes/full/+page.server.ts
import type { PageServerLoad } from './$types';
import { allEntries, listDrivers } from '$lib/db';

export const load: PageServerLoad = async () => {
  return { entries: await allEntries(), drivers: await listDrivers() };
};

