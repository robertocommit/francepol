<!-- src/routes/full/+page.svelte -->
<script lang="ts">
  export let data: {
    entries: {
      driver: string; month: string; frachty: number; paliwo: number; razem: number; wynagr: number; wynik_mc: number; wynik_narast: number;
    }[];
    drivers: string[];
  };
  
  let filter = '';
  let sortBy = 'month';
  let sortOrder = 'asc';
  let currentPage = 1;
  let itemsPerPage = 50;

  function fmt(n: number) { 
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
  }

  function getResultBadgeClass(value: number) {
    if (value > 0) return 'badge-success';
    if (value < 0) return 'badge-danger';
    return 'badge-info';
  }

  // Filter and sort data
  $: filteredEntries = data.entries
    .filter(e => e.driver.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'driver':
          aVal = a.driver;
          bVal = b.driver;
          break;
        case 'month':
          aVal = a.month;
          bVal = b.month;
          break;
        case 'frachty':
          aVal = a.frachty;
          bVal = b.frachty;
          break;
        case 'paliwo':
          aVal = a.paliwo;
          bVal = b.paliwo;
          break;
        case 'razem':
          aVal = a.razem;
          bVal = b.razem;
          break;
        case 'wynagr':
          aVal = a.wynagr;
          bVal = b.wynagr;
          break;
        case 'wynik_mc':
          aVal = a.wynik_mc;
          bVal = b.wynik_mc;
          break;
        case 'wynik_narast':
          aVal = a.wynik_narast;
          bVal = b.wynik_narast;
          break;
        default:
          aVal = a.month;
          bVal = b.month;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

  // Pagination
  $: totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  $: paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function setSort(column: string) {
    if (sortBy === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortOrder = 'asc';
    }
    currentPage = 1;
  }

  function getSortIcon(column: string) {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  // Calculate summary statistics
  $: totalEntries = data.entries.length;
  $: totalDrivers = data.drivers.length;
  $: totalFrachty = data.entries.reduce((sum, e) => sum + e.frachty, 0);
  $: totalPaliwo = data.entries.reduce((sum, e) => sum + e.paliwo, 0);
  $: totalRazem = data.entries.reduce((sum, e) => sum + e.razem, 0);
  $: avgWynikMc = data.entries.length > 0 ? data.entries.reduce((sum, e) => sum + e.wynik_mc, 0) / data.entries.length : 0;
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
            <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Pełny zestaw danych</h1>
              <p class="text-sm text-gray-600">Wszystkie rekordy finansowe</p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-600">
            {filteredEntries.length} z {totalEntries} rekordów
          </div>
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
            <p class="text-orange-100 text-sm font-medium">Średni Wynik MC</p>
            <p class="text-2xl font-bold">{fmt(avgWynikMc)} zł</p>
          </div>
          <svg class="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Filters and Controls -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
          </svg>
          <span>Filtry i sortowanie</span>
        </h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label for="filter-input" class="block text-sm font-medium text-gray-700 mb-2">Filtruj kierowcę</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              id="filter-input"
              type="text" 
              placeholder="Wpisz nazwę kierowcy..." 
              bind:value={filter}
              class="input-modern pl-10"
            />
          </div>
        </div>
        
        <div>
          <label for="sort-by" class="block text-sm font-medium text-gray-700 mb-2">Sortuj według</label>
          <select id="sort-by" bind:value={sortBy} class="input-modern">
            <option value="month">Miesiąc</option>
            <option value="driver">Kierowca</option>
            <option value="frachty">Frachty</option>
            <option value="paliwo">Paliwo</option>
            <option value="razem">Razem</option>
            <option value="wynagr">Wynagrodzenie</option>
            <option value="wynik_mc">Wynik MC</option>
            <option value="wynik_narast">Wynik narastający</option>
          </select>
        </div>
        
        <div>
          <label for="sort-order" class="block text-sm font-medium text-gray-700 mb-2">Kolejność</label>
          <select id="sort-order" bind:value={sortOrder} class="input-modern">
            <option value="asc">Rosnąco</option>
            <option value="desc">Malejąco</option>
          </select>
        </div>
        
        <div>
          <label for="items-per-page" class="block text-sm font-medium text-gray-700 mb-2">Rekordów na stronę</label>
          <select id="items-per-page" bind:value={itemsPerPage} class="input-modern">
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
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
          <span>Wszystkie rekordy</span>
        </h2>
      </div>

      <div class="overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th class="text-left cursor-pointer hover:bg-gray-100" on:click={() => setSort('driver')}>
                <div class="flex items-center space-x-1">
                  <span>Kierowca</span>
                  <span class="text-xs">{getSortIcon('driver')}</span>
                </div>
              </th>
              <th class="text-left cursor-pointer hover:bg-gray-100" on:click={() => setSort('month')}>
                <div class="flex items-center space-x-1">
                  <span>Miesiąc</span>
                  <span class="text-xs">{getSortIcon('month')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('frachty')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Frachty-fra</span>
                  <span class="text-xs">{getSortIcon('frachty')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('paliwo')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Paliwo</span>
                  <span class="text-xs">{getSortIcon('paliwo')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('razem')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Razem</span>
                  <span class="text-xs">{getSortIcon('razem')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('wynagr')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Wynagr.</span>
                  <span class="text-xs">{getSortIcon('wynagr')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('wynik_mc')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Wynik MC</span>
                  <span class="text-xs">{getSortIcon('wynik_mc')}</span>
                </div>
              </th>
              <th class="text-right cursor-pointer hover:bg-gray-100" on:click={() => setSort('wynik_narast')}>
                <div class="flex items-center justify-end space-x-1">
                  <span>Wynik narast.</span>
                  <span class="text-xs">{getSortIcon('wynik_narast')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each paginatedEntries as r}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="font-medium">
                  <a 
                    href={"/driver/" + encodeURIComponent(r.driver)} 
                    class="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {r.driver}
                  </a>
                </td>
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

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Strona {currentPage} z {totalPages} ({filteredEntries.length} rekordów)
          </div>
          <div class="flex items-center space-x-2">
            <button 
              class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              on:click={() => currentPage = Math.max(1, currentPage - 1)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Poprzednia
            </button>
            
            <div class="flex items-center space-x-1">
              {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                const page = start + i;
                return page <= totalPages ? page : null;
              }).filter(Boolean) as page}
                <button 
                  class="px-3 py-1 text-sm rounded {page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}"
                  on:click={() => currentPage = page}
                >
                  {page}
                </button>
              {/each}
            </div>
            
            <button 
              class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            >
              Następna
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      {/if}

      {#if filteredEntries.length === 0}
        <div class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500 text-lg">Nie znaleziono rekordów spełniających kryteria</p>
        </div>
      {/if}
    </div>
  </div>
</div>

