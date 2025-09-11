<script lang="ts">
  export let data: { drivers: { id: number; name: string }[] };

  let selectedIds: string[] = [];
  $: allIds = data.drivers.map((d) => String(d.id));
  $: allSelected = selectedIds.length > 0 && selectedIds.length === allIds.length;

  function toggleSelectAll() {
    selectedIds = allSelected ? [] : [...allIds];
  }
</script>

<section class="space-y-4">
  <h1 class="text-xl font-semibold">Drivers</h1>

  <form method="post" action="?/create" class="flex gap-2 items-center">
    <input name="name" placeholder="New driver name" required class="input" />
    <button type="submit" class="btn">Add</button>
  </form>

  <form id="bulk" method="post" action="?/bulkDelete" class="flex items-center gap-2">
    <button type="submit" class="btn btn-danger" disabled={selectedIds.length === 0}>
      Delete selected ({selectedIds.length})
    </button>
  </form>

  <div class="overflow-auto">
    <table class="min-w-full border-collapse">
      <thead>
        <tr>
          <th class="p-2 border-b"><input type="checkbox" checked={allSelected} on:change={toggleSelectAll} aria-label="Select all" /></th>
          <th class="p-2 border-b text-left">Name</th>
          <th class="p-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.drivers as driver (driver.id)}
          <tr>
            <td class="p-2 border-b text-center">
              <input type="checkbox" name="ids" value={driver.id} bind:group={selectedIds} form="bulk" />
            </td>
            <td class="p-2 border-b">
              <form method="post" action="?/update" class="flex gap-2 items-center">
                <input type="hidden" name="id" value={driver.id} />
                <input type="text" name="name" value={driver.name} required class="input w-full" />
                <button type="submit" class="btn">Save</button>
              </form>
            </td>
            <td class="p-2 border-b text-center">
              <form method="post" action="?/delete">
                <input type="hidden" name="id" value={driver.id} />
                <button type="submit" class="btn btn-danger">Delete</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  /* Minimal styles; replace with Tailwind or your design system */
  .input { border: 1px solid #ddd; padding: 0.5rem; border-radius: 0.25rem; }
  .btn { padding: 0.4rem 0.75rem; border: 1px solid #ccc; border-radius: 0.25rem; background: #f8f8f8; }
  .btn-danger { border-color: #fca5a5; background: #fee2e2; }
</style>
