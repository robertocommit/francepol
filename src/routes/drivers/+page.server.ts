import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listDrivers, createDriver, updateDriver, deleteDriver, deleteDrivers } from '$lib/server/drivers';

export const load: PageServerLoad = async () => {
  const drivers = await listDrivers();
  return { drivers };
};

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

export const actions: Actions = {
  create: async ({ request }) => {
    const fd = await request.formData();
    const name = getStr(fd, 'name').trim();
    if (!name) return fail(400, { error: 'Name is required' });
    await createDriver(name);
    return { success: true };
  },
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = Number(getStr(fd, 'id'));
    const name = getStr(fd, 'name').trim();
    if (!id || !name) return fail(400, { error: 'Invalid data' });
    await updateDriver(id, name);
    return { success: true };
  },
  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = Number(getStr(fd, 'id'));
    if (!id) return fail(400, { error: 'Invalid id' });
    await deleteDriver(id);
    return { success: true };
  },
  bulkDelete: async ({ request }) => {
    const fd = await request.formData();
    const ids = fd.getAll('ids').map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    if (ids.length === 0) return fail(400, { error: 'No drivers selected' });
    await deleteDrivers(ids);
    return { success: true, deleted: ids.length };
  }
};
