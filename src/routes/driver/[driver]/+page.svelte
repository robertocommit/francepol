<!-- src/routes/driver/[driver]/+page.svelte -->
<script lang="ts">
  export let data: {
    driver: string;
    entries: { month: string; frachty: number; paliwo: number; razem: number; wynagr: number; wynik_mc: number; wynik_narast: number; }[];
  };

  function fmt(n: number) { 
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
  }

  function getResultBadgeClass(value: number) {
    if (value > 0) return 'badge-success';
    if (value < 0) return 'badge-danger';
    return 'badge-info';
  }

  // Calculate driver statistics
  const totalFrachty = data.entries.reduce((sum, e) => sum + e.frachty, 0);
  const totalPaliwo = data.entries.reduce((sum, e) => sum + e.paliwo, 0);
  const totalRazem = data.entries.reduce((sum, e) => sum + e.razem, 0);
  const totalWynagr = data.entries.reduce((sum, e) => sum + e.wynagr, 0);
  const totalWynikMc = data.entries.reduce((sum, e) => sum + e.wynik_mc, 0);
  const totalWynikNarast = data.entries.reduce((sum, e) => sum + e.wynik_narast, 0);
  const avgWynikMc = data.entries.length > 0 ? totalWynikMc / data.entries.length : 0;
  
  // Get latest entry for current status
  const latestEntry = data.entries[data.entries.length - 1];
  const firstEntry = data.entries[0];
  
  // Calculate performance trend
  const performanceTrend = latestEntry ? latestEntry.wynik_narast - (firstEntry?.wynik_narast || 0) : 0;
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
            <div class="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{data.driver}</h1>
              <p class="text-sm text-gray-600">Szczegóły finansowe kierowcy</p>
            </div>
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

  <div class="max-w-7xl mx-auto p-6 space-y-6">
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
            <p class="text-orange-100 text-sm font-medium">Wynik Narastający</p>
            <p class="text-2xl font-bold">{fmt(totalWynikNarast)} zł</p>
          </div>
          <svg class="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Performance Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Statystyki</span>
          </h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Liczba miesięcy:</span>
            <span class="font-semibold">{data.entries.length}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Średni wynik MC:</span>
            <span class="font-semibold">{fmt(avgWynikMc)} zł</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Trend wydajności:</span>
            <span class="badge {getResultBadgeClass(performanceTrend)}">
              {performanceTrend > 0 ? '↗' : performanceTrend < 0 ? '↘' : '→'} {fmt(performanceTrend)}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Okres aktywności</span>
          </h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Pierwszy miesiąc:</span>
            <span class="font-semibold">{firstEntry?.month || 'N/A'}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Ostatni miesiąc:</span>
            <span class="font-semibold">{latestEntry?.month || 'N/A'}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Status:</span>
            <span class="badge {getResultBadgeClass(latestEntry?.wynik_narast || 0)}">
              {latestEntry?.wynik_narast && latestEntry.wynik_narast > 0 ? 'Pozytywny' : 'Negatywny'}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <span>Wydajność</span>
          </h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Najlepszy miesiąc:</span>
            <span class="font-semibold">
              {data.entries.reduce((best, current) => 
                current.wynik_mc > best.wynik_mc ? current : best
              ).month}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Najlepszy wynik:</span>
            <span class="font-semibold text-green-600">
              {fmt(Math.max(...data.entries.map(e => e.wynik_mc)))}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Najgorszy wynik:</span>
            <span class="font-semibold text-red-600">
              {fmt(Math.min(...data.entries.map(e => e.wynik_mc)))}
            </span>
          </div>
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
          <span>Historia miesięczna</span>
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
            {#each data.entries as r}
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

      {#if data.entries.length === 0}
        <div class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500 text-lg">Brak danych dla tego kierowcy</p>
        </div>
      {/if}
    </div>
  </div>
</div>

