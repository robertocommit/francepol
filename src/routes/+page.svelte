<!-- src/routes/+page.svelte -->
<script lang="ts">
  export let data: {
    drivers: string[];
    selectedDrivers: string[];
    totals: {
      driver: string; month: string; frachty: number; paliwo: number; razem: number; wynagr: number; wynik_mc: number; wynik_narast: number;
    }[];
  };

  let selected = new Set<string>(data.selectedDrivers);
  let searchTerm = '';

  function toggle(d: string) {
    if (selected.has(d)) selected.delete(d); else selected.add(d);
    const params = new URLSearchParams();
    [...selected].forEach((s) => params.append('driver', s));
    const qs = params.toString();
    const url = qs ? `/?${qs}` : '/';
    window.location.href = url;
  }

  function fmt(n: number) { 
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
  }

  function getResultBadgeClass(value: number) {
    if (value > 0) return 'badge-success';
    if (value < 0) return 'badge-danger';
    return 'badge-info';
  }

  const filteredDrivers = data.drivers.filter(driver => 
    driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const totalFrachty = data.totals.reduce((sum, t) => sum + t.frachty, 0);
  const totalPaliwo = data.totals.reduce((sum, t) => sum + t.paliwo, 0);
  const totalRazem = data.totals.reduce((sum, t) => sum + t.razem, 0);
  const totalWynagr = data.totals.reduce((sum, t) => sum + t.wynagr, 0);
  const totalWynikMc = data.totals.reduce((sum, t) => sum + t.wynik_mc, 0);
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Transport Dashboard</h1>
            <p class="text-sm text-gray-600">Analiza finansowa kierowców</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/full" class="btn btn-primary flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Pełny zestaw danych</span>
          </a>
        </div>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
    <!-- Sidebar -->
    <aside class="col-span-12 lg:col-span-3 space-y-6">
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>Kierowcy ({data.drivers.length})</span>
          </h2>
        </div>
        
        <!-- Search -->
        <div class="mb-4">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Szukaj kierowcy..." 
              bind:value={searchTerm}
              class="input-modern pl-10"
            />
          </div>
        </div>

        <!-- Driver List -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each filteredDrivers as d}
            <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200 group">
              <input 
                type="checkbox" 
                checked={selected.has(d)} 
                on:change={() => toggle(d)}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <a 
                href={"/driver/" + encodeURIComponent(d)} 
                class="flex-1 text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
              >
                {d}
              </a>
              {#if selected.has(d)}
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              {/if}
            </label>
          {/each}
        </div>

        <!-- Selection Summary -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">{selected.size}</span> z {data.drivers.length} kierowców wybranych
          </p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="col-span-12 lg:col-span-9 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">Łączne Frachty</p>
              <p class="text-2xl font-bold">{fmt(totalFrachty)} zł</p>
            </div>
            <svg class="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>

        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Łączne Paliwo</p>
              <p class="text-2xl font-bold">{fmt(totalPaliwo)} zł</p>
            </div>
            <svg class="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
            </svg>
          </div>
        </div>

        <div class="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">Łączne Razem</p>
              <p class="text-2xl font-bold">{fmt(totalRazem)} zł</p>
            </div>
            <svg class="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>

        <div class="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm font-medium">Wynik MC</p>
              <p class="text-2xl font-bold">{fmt(totalWynikMc)} zł</p>
            </div>
            <svg class="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Podsumowanie miesięczne</span>
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="table-modern">
            <thead>
              <tr>
                <th class="text-left">Miesiąc</th>
                <th class="text-right">Frachty-fra</th>
                <th class="text-right">Paliwo</th>
                <th class="text-right">Razem</th>
                <th class="text-right">Wynagr.</th>
                <th class="text-right">Wynik MC</th>
                <th class="text-right">Wynik narast.</th>
              </tr>
            </thead>
            <tbody>
              {#each data.totals as r}
                <tr class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="font-medium text-gray-900">{r.month}</td>
                  <td class="text-right font-mono">{fmt(r.frachty)}</td>
                  <td class="text-right font-mono">{fmt(r.paliwo)}</td>
                  <td class="text-right font-mono font-semibold">{fmt(r.razem)}</td>
                  <td class="text-right font-mono">{fmt(r.wynagr)}</td>
                  <td class="text-right">
                    <span class="badge {getResultBadgeClass(r.wynik_mc)}">
                      {fmt(r.wynik_mc)}
                    </span>
                  </td>
                  <td class="text-right">
                    <span class="badge {getResultBadgeClass(r.wynik_narast)}">
                      {fmt(r.wynik_narast)}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if data.totals.length === 0}
          <div class="text-center py-12">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-gray-500 text-lg">Wybierz kierowców, aby zobaczyć dane</p>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>
