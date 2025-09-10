// src/routes/driver/[driver]/+page.server.ts
import type { PageServerLoad } from './$types';
import { entriesByDriver } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
  const driver = decodeURIComponent(params.driver);
  const entries = entriesByDriver(driver);
  return { driver, entries };
};

