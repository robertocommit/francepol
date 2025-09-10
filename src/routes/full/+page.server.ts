// src/routes/full/+page.server.ts
import type { PageServerLoad } from './$types';
import { allEntries, listDrivers } from '$lib/db';

export const load: PageServerLoad = async () => {
  return { entries: allEntries(), drivers: listDrivers() };
};

