import type { PageServerLoad } from './$types';
import { allEntries } from '$lib/db';

export const load: PageServerLoad = async () => {
  const entries = await allEntries();
  return { entries };
};


