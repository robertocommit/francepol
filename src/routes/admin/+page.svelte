<script lang="ts">
  import francepolLogo from '$lib/assets/francepol-logo.svg';
  import { onMount } from 'svelte';

  type Entry = {
    id: number;
    driver: string;
    month: string;
    frachty: number;
    paliwo: number;
    razem: number;
    wynagr: number;
    wynik_mc: number;
    wynik_narast: number;
  };

  export let data: { entries: Entry[] };
  let entries: Entry[] = data.entries ?? [];
  let driver = '';
  let month = '';
  let frachty: number | string = '';
  let paliwo: number | string = '';
  let razem: number | string = '';
  let wynagr: number | string = '';
  let wynik_mc: number | string = '';
  let wynik_narast: number | string = '';
  let filter = '';
  let editingId: number | null = null;
  let rowDraft: Entry | null = null;

  async function loadData() {
    const res = await fetch('/api/data');
    const json = await res.json();
    entries = json.entries ?? [];
  }

  function resetForm() {
    driver = '';
    month = '';
    frachty = '';
    paliwo = '';
    razem = '';
    wynagr = '';
    wynik_mc = '';
    wynik_narast = '';
  }

  async function saveEntry() {
    const payload = {
      driver: driver.trim(),
      month,
      frachty: Number(frachty) || 0,
      paliwo: Number(paliwo) || 0,
      razem: Number(razem) || 0,
      wynagr: Number(wynagr) || 0,
      wynik_mc: Number(wynik_mc) || 0,
      wynik_narast: Number(wynik_narast) || 0
    };
    const res = await fetch('/api/data', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      await loadData();
      resetForm();
    } else {
      alert('Nie udało się zapisać rekordu');
    }
  }

  async function deleteOne(e: Entry) {
    const qs = new URLSearchParams({ driver: e.driver, month: e.month });
    const res = await fetch(`/api/data?${qs.toString()}`, { method: 'DELETE' });
    if (res.ok) await loadData();
  }

  async function deleteAllForDriver(name: string) {
    if (!confirm(`Usunąć wszystkie rekordy dla: ${name}?`)) return;
    const qs = new URLSearchParams({ driver: name, all: 'true' });
    const res = await fetch(`/api/data?${qs.toString()}`, { method: 'DELETE' });
    if (res.ok) await loadData();
  }

  function startInlineEdit(e: Entry) {
    editingId = e.id;
    rowDraft = { ...e };
  }

  function cancelInlineEdit() {
    editingId = null;
    rowDraft = null;
  }

  async function saveInlineEdit() {
    if (!rowDraft) return;
    const payload = {
      id: rowDraft.id,
      driver: rowDraft.driver.trim(),
      month: rowDraft.month,
      frachty: Number(rowDraft.frachty) || 0,
      paliwo: Number(rowDraft.paliwo) || 0,
      razem: Number(rowDraft.razem) || 0,
      wynagr: Number(rowDraft.wynagr) || 0,
      wynik_mc: Number(rowDraft.wynik_mc) || 0,
      wynik_narast: Number(rowDraft.wynik_narast) || 0
    };
    const res = await fetch('/api/data', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      await loadData();
      cancelInlineEdit();
    } else {
      alert('Nie udało się zapisać rekordu');
    }
  }

  $: filtered = entries.filter(e =>
    e.driver.toLowerCase().includes(filter.toLowerCase())
  );

  onMount(() => {
    // Optionally refresh on client mount; server has already provided initial data
  });

  function fmt(n: number | null | undefined) {
    if (n == null || Number.isNaN(n)) return '0.00';
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
  <header class="bg-white/90 backdrop-blur-md border-b border-red-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <a href="/" class="btn btn-secondary flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Powrót</span>
          </a>
          <div class="w-px h-8 bg-gray-300"></div>
          <div class="flex items-center space-x-3">
            <img src={francepolLogo} alt="FRANCEPOL" class="h-8 w-auto" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Panel administracyjny</h1>
              <p class="text-sm text-gray-600">Zarządzanie rekordami finansowymi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900">Dodaj/Edytuj rekord</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <input class="input-modern" placeholder="Kierowca" bind:value={driver} />
        <input class="input-modern" type="date" placeholder="Miesiąc" bind:value={month} />
        <input class="input-modern" type="number" step="0.01" placeholder="Frachty" bind:value={frachty} />
        <input class="input-modern" type="number" step="0.01" placeholder="Paliwo" bind:value={paliwo} />
        <input class="input-modern" type="number" step="0.01" placeholder="Razem" bind:value={razem} />
        <input class="input-modern" type="number" step="0.01" placeholder="Wynagr." bind:value={wynagr} />
        <input class="input-modern" type="number" step="0.01" placeholder="Wynik MC" bind:value={wynik_mc} />
        <input class="input-modern" type="number" step="0.01" placeholder="Wynik narast." bind:value={wynik_narast} />
      </div>
      <div class="mt-3 flex gap-2">
        <button class="btn btn-primary" on:click={saveEntry}>Zapisz</button>
        <button class="btn btn-outline" on:click={resetForm}>Wyczyść formularz</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Wszystkie rekordy</h2>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input class="input-modern input-with-icon" placeholder="Szukaj kierowcy..." bind:value={filter} />
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Kierowca</th>
              <th>Miesiąc</th>
              <th class="text-right">Frachty</th>
              <th class="text-right">Paliwo</th>
              <th class="text-right">Razem</th>
              <th class="text-right">Wynagr.</th>
              <th class="text-right">Wynik MC</th>
              <th class="text-right">Wynik narast.</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as e}
              <tr>
                {#if editingId === e.id}
                  <td><input class="input-modern" bind:value={rowDraft!.driver} /></td>
                  <td><input class="input-modern" type="date" bind:value={rowDraft!.month} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.frachty} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.paliwo} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.razem} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.wynagr} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.wynik_mc} /></td>
                  <td class="text-right"><input class="input-modern text-right" type="number" step="0.01" bind:value={rowDraft!.wynik_narast} /></td>
                  <td class="flex gap-2">
                    <button class="btn btn-primary" on:click={saveInlineEdit}>Zapisz</button>
                    <button class="btn btn-secondary" on:click={cancelInlineEdit}>Anuluj</button>
                  </td>
                {:else}
                  <td>{e.driver}</td>
                  <td>{e.month}</td>
                  <td class="text-right font-mono">{fmt(e.frachty)}</td>
                  <td class="text-right font-mono">{fmt(e.paliwo)}</td>
                  <td class="text-right font-mono">{fmt(e.razem)}</td>
                  <td class="text-right font-mono">{fmt(e.wynagr)}</td>
                  <td class="text-right font-mono">{fmt(e.wynik_mc)}</td>
                  <td class="text-right font-mono">{fmt(e.wynik_narast)}</td>
                  <td class="flex gap-2">
                    <button class="btn btn-outline" on:click={() => startInlineEdit(e)}>Edytuj wiersz</button>
                    <button class="btn btn-secondary" on:click={() => deleteOne(e)}>Usuń</button>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>


