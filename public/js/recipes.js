/**
 * CraftersMC Recipes & Crafting Database Controller
 * Handles loading, high-performance searching, station filtering, visual 3x3 grids, and pagination for 2,500+ recipes.
 */

(function () {
  'use strict';

  // State
  let allRecipes = [];
  let filteredRecipes = [];
  let currentPage = 1;
  const recipesPerPage = 36;
  let viewMode = 'grid'; // 'grid' or 'list'
  let searchQuery = '';
  let selectedStation = 'all';
  let sortBy = 'default';

  // Station Metadata
  const STATIONS = [
    { id: 'all', name: 'All Stations', icon: 'apps' },
    { id: 'crafting_table', name: 'Crafting Table', icon: 'grid_view' },
    { id: 'furnace', name: 'Furnace', icon: 'local_fire_department' },
    { id: 'blast_furnace', name: 'Blast Furnace', icon: 'whatshot' },
    { id: 'smoker', name: 'Smoker', icon: 'restaurant' },
    { id: 'campfire', name: 'Campfire', icon: 'outdoor_grill' },
    { id: 'stonecutter', name: 'Stonecutter', icon: 'content_cut' },
    { id: 'cartography_table', name: 'Cartography', icon: 'map' }
  ];

  // DOM Elements
  const searchInput = document.getElementById('recipeSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const stationSelect = document.getElementById('stationSelect');
  const sortSelect = document.getElementById('sortSelect');
  const filterChipsContainer = document.getElementById('filterChips');
  const gridContainer = document.getElementById('recipesGrid');
  const listContainer = document.getElementById('recipesList');
  const tableBody = document.getElementById('recipesTableBody');
  const paginationContainer = document.getElementById('recipesPagination');
  const emptyState = document.getElementById('emptyState');
  const resultsCounter = document.getElementById('resultsCounter');
  const activeFiltersDesc = document.getElementById('activeFiltersDesc');
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');

  // Hero Stat Elements
  const heroTotalCount = document.getElementById('heroTotalCount');
  const heroCraftingCount = document.getElementById('heroCraftingCount');
  const heroSmeltingCount = document.getElementById('heroSmeltingCount');
  const heroStonecutterCount = document.getElementById('heroStonecutterCount');
  const heroCartographyCount = document.getElementById('heroCartographyCount');

  // Toast
  const toast = document.getElementById('recipeToast');
  const toastText = document.getElementById('recipeToastText');

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  async function copyToClipboard(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg || 'Copied to clipboard!');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg || 'Copied to clipboard!');
    }
  }

  window.copyGiveCommand = function (identifier, count) {
    if (!identifier) {
      showToast('Item identifier not available');
      return;
    }
    const cmd = `/give @p ${identifier} ${count || 1}`;
    copyToClipboard(cmd, `Copied: ${cmd}`);
  };

  window.filterByIngredient = function (ingName) {
    if (!searchInput) return;
    searchInput.value = ingName;
    searchQuery = ingName.toLowerCase().trim();
    if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    currentPage = 1;
    applyFilters();
    const toolbar = document.querySelector('.items-toolbar') || document.querySelector('.recipes-toolbar');
    if (toolbar) {
      toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  function getStationIcon(block) {
    switch (block) {
      case 'crafting_table': return 'grid_view';
      case 'furnace': return 'local_fire_department';
      case 'blast_furnace': return 'whatshot';
      case 'smoker': return 'restaurant';
      case 'campfire': return 'outdoor_grill';
      case 'stonecutter': return 'content_cut';
      case 'cartography_table': return 'map';
      default: return 'construction';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Render Filter Chips
  function renderFilterChips() {
    if (!filterChipsContainer) return;

    // Count recipes per station
    const counts = { all: allRecipes.length };
    allRecipes.forEach(r => {
      const b = r.block || 'crafting_table';
      counts[b] = (counts[b] || 0) + 1;
    });

    filterChipsContainer.innerHTML = STATIONS.map(st => {
      const count = counts[st.id] || 0;
      const isActive = selectedStation === st.id;
      return `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-station="${st.id}">
          <span class="material-icons" style="font-size:16px;">${st.icon}</span>
          <span>${st.name}</span>
          <span class="chip-count">${count}</span>
        </button>
      `;
    }).join('');

    filterChipsContainer.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStation = btn.getAttribute('data-station');
        if (stationSelect) stationSelect.value = selectedStation;
        currentPage = 1;
        updateActiveChips();
        applyFilters();
      });
    });
  }

  function updateActiveChips() {
    if (!filterChipsContainer) return;
    filterChipsContainer.querySelectorAll('.filter-chip').forEach(btn => {
      const id = btn.getAttribute('data-station');
      if (id === selectedStation) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Update Hero Stats
  function updateHeroStats() {
    if (heroTotalCount) heroTotalCount.textContent = allRecipes.length.toLocaleString();
    let crafting = 0;
    let smelting = 0;
    let stonecutter = 0;
    let carto = 0;

    allRecipes.forEach(r => {
      const b = r.block || '';
      if (b === 'crafting_table') crafting++;
      else if (b === 'furnace' || b === 'blast_furnace' || b === 'smoker' || b === 'campfire') smelting++;
      else if (b === 'stonecutter') stonecutter++;
      else if (b === 'cartography_table') carto++;
    });

    if (heroCraftingCount) heroCraftingCount.textContent = crafting.toLocaleString();
    if (heroSmeltingCount) heroSmeltingCount.textContent = smelting.toLocaleString();
    if (heroStonecutterCount) heroStonecutterCount.textContent = stonecutter.toLocaleString();
    if (heroCartographyCount) heroCartographyCount.textContent = carto.toLocaleString();
  }

  // Apply Filters & Search
  function applyFilters() {
    let result = allRecipes;

    // Station Filter
    if (selectedStation !== 'all') {
      result = result.filter(r => r.block === selectedStation);
    }

    // Search Query Filter
    if (searchQuery) {
      const q = searchQuery;
      result = result.filter(r => {
        // Match output name
        if (r.name && r.name.toLowerCase().includes(q)) return true;
        // Match output identifier
        if (r.output && r.output.identifier && r.output.identifier.toLowerCase().includes(q)) return true;
        // Match recipe ID
        if (r.recipeId && r.recipeId.toLowerCase().includes(q)) return true;
        // Match output numeric ID
        if (r.output && r.output.numericId && String(r.output.numericId) === q) return true;
        // Match ingredients
        if (r.ingredients && r.ingredients.some(ing => {
          if (ing.name && ing.name.toLowerCase().includes(q)) return true;
          if (ing.identifier && ing.identifier.toLowerCase().includes(q)) return true;
          if (String(ing.numericId) === q) return true;
          return false;
        })) return true;

        return false;
      });
    }

    // Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'station') {
      result.sort((a, b) => (a.stationName || '').localeCompare(b.stationName || ''));
    } else if (sortBy === 'ing-asc') {
      result.sort((a, b) => (a.ingredients ? a.ingredients.length : 0) - (b.ingredients ? b.ingredients.length : 0));
    } else if (sortBy === 'ing-desc') {
      result.sort((a, b) => (b.ingredients ? b.ingredients.length : 0) - (a.ingredients ? a.ingredients.length : 0));
    }

    filteredRecipes = result;
    renderResults();
  }

  // Render Results
  function renderResults() {
    const total = filteredRecipes.length;
    const startIdx = (currentPage - 1) * recipesPerPage;
    const pageItems = filteredRecipes.slice(startIdx, startIdx + recipesPerPage);

    // Update Counter & Active Filter Banner
    if (resultsCounter) {
      if (total === 0) {
        resultsCounter.textContent = 'No recipes found';
      } else {
        const startNum = startIdx + 1;
        const endNum = Math.min(startIdx + recipesPerPage, total);
        resultsCounter.innerHTML = `Showing <strong>${startNum.toLocaleString()}–${endNum.toLocaleString()}</strong> of <strong>${total.toLocaleString()}</strong> recipes`;
      }
    }

    if (activeFiltersDesc) {
      const activeParts = [];
      if (selectedStation !== 'all') {
        const stObj = STATIONS.find(s => s.id === selectedStation);
        activeParts.push(`Station: ${stObj ? stObj.name : selectedStation}`);
      }
      if (searchQuery) {
        activeParts.push(`Search: "${escapeHtml(searchQuery)}"`);
      }
      if (activeParts.length > 0) {
        activeFiltersDesc.style.display = 'inline-flex';
        activeFiltersDesc.innerHTML = `Filtered by: ${activeParts.join(' &bull; ')} <span class="recipes-reset-link" onclick="document.getElementById('clearSearchBtn').click();">Clear</span>`;
      } else {
        activeFiltersDesc.style.display = 'none';
      }
    }

    // Toggle Empty State
    if (total === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      if (gridContainer) gridContainer.style.display = 'none';
      if (listContainer) listContainer.style.display = 'none';
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (viewMode === 'grid') {
      if (gridContainer) {
        gridContainer.style.display = 'grid';
        gridContainer.innerHTML = pageItems.map(renderRecipeCard).join('');
      }
      if (listContainer) listContainer.style.display = 'none';
    } else {
      if (listContainer) {
        listContainer.style.display = 'block';
        if (tableBody) {
          tableBody.innerHTML = pageItems.map(renderTableRow).join('');
        }
      }
      if (gridContainer) gridContainer.style.display = 'none';
    }

    renderPagination(total);
  }

  // Render a Single Recipe Card in Grid View
  function renderRecipeCard(r) {
    const stationIcon = getStationIcon(r.block);
    const stationClass = `station-${r.block || 'crafting_table'}`;
    const outputName = escapeHtml(r.output?.name || r.name || 'Custom Item');
    const outputCount = r.output?.count || 1;
    const outputIdent = escapeHtml(r.output?.identifier || '');
    const outputImg = r.output?.image;

    // Visual matrix layout based on station
    let visualAreaHtml = '';

    if (r.block === 'crafting_table') {
      // 3x3 Grid
      const grid = r.grid || [];
      const slotsHtml = [];

      for (let i = 0; i < 9; i++) {
        const item = grid[i];
        if (item) {
          const itemTitle = escapeHtml(`${item.name} (x${item.count || 1})`);
          slotsHtml.push(`
            <div class="recipe-grid-slot filled" title="${itemTitle}">
              ${item.image
                ? `<img class="recipe-slot-img" src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none;">category</span>`
                : `<span class="material-icons recipe-slot-fallback">category</span>`
              }
              ${item.count > 1 ? `<span class="recipe-slot-qty">${item.count}</span>` : ''}
            </div>
          `);
        } else {
          slotsHtml.push(`<div class="recipe-grid-slot empty"></div>`);
        }
      }

      visualAreaHtml = `
        <div class="recipe-matrix-wrapper">
          <div class="recipe-crafting-grid">
            ${slotsHtml.join('')}
          </div>
          <div class="recipe-arrow-divider">
            <span class="recipe-arrow-badge">
              <span class="material-icons recipe-arrow-icon">arrow_forward</span>
            </span>
          </div>
          <div class="recipe-output-slot-wrap">
            <div class="recipe-output-slot" title="${outputName} x${outputCount}">
              ${outputImg
                ? `<img class="recipe-slot-img" src="${outputImg}" alt="${outputName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none; font-size:26px;">inventory_2</span>`
                : `<span class="material-icons recipe-slot-fallback" style="font-size:26px;">inventory_2</span>`
              }
              ${outputCount > 1 ? `<span class="recipe-slot-qty">${outputCount}</span>` : ''}
            </div>
            <span class="recipe-output-slot-label">Result</span>
          </div>
        </div>
      `;
    } else if (r.block === 'furnace' || r.block === 'blast_furnace' || r.block === 'smoker' || r.block === 'campfire') {
      // Smelting / Cooking Layout
      const input = (r.ingredients && r.ingredients[0]) || { name: 'Raw Material', count: 1 };
      const inputTitle = escapeHtml(`${input.name} (x${input.count || 1})`);

      visualAreaHtml = `
        <div class="recipe-smelt-wrapper">
          <div class="recipe-smelt-node">
            <div class="recipe-grid-slot filled" title="${inputTitle}">
              ${input.image
                ? `<img class="recipe-slot-img" src="${input.image}" alt="${escapeHtml(input.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none;">category</span>`
                : `<span class="material-icons recipe-slot-fallback">category</span>`
              }
              ${input.count > 1 ? `<span class="recipe-slot-qty">${input.count}</span>` : ''}
            </div>
            <span class="recipe-smelt-label">Input</span>
          </div>

          <div class="recipe-smelt-process">
            <div class="recipe-process-badge flame">
              <span class="material-icons recipe-flame-icon">local_fire_department</span>
            </div>
            <span class="material-icons recipe-process-arrow">arrow_forward</span>
          </div>

          <div class="recipe-smelt-node">
            <div class="recipe-output-slot" title="${outputName} x${outputCount}">
              ${outputImg
                ? `<img class="recipe-slot-img" src="${outputImg}" alt="${outputName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none; font-size:26px;">inventory_2</span>`
                : `<span class="material-icons recipe-slot-fallback" style="font-size:26px;">inventory_2</span>`
              }
              ${outputCount > 1 ? `<span class="recipe-slot-qty">${outputCount}</span>` : ''}
            </div>
            <span class="recipe-smelt-label">Product</span>
          </div>
        </div>
      `;
    } else if (r.block === 'stonecutter') {
      // Stonecutter Layout
      const input = (r.ingredients && r.ingredients[0]) || { name: 'Stone Material', count: 1 };
      const inputTitle = escapeHtml(`${input.name} (x${input.count || 1})`);

      visualAreaHtml = `
        <div class="recipe-smelt-wrapper">
          <div class="recipe-smelt-node">
            <div class="recipe-grid-slot filled" title="${inputTitle}">
              ${input.image
                ? `<img class="recipe-slot-img" src="${input.image}" alt="${escapeHtml(input.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none;">category</span>`
                : `<span class="material-icons recipe-slot-fallback">category</span>`
              }
            </div>
            <span class="recipe-smelt-label">Block</span>
          </div>

          <div class="recipe-smelt-process">
            <div class="recipe-process-badge stonecutter">
              <span class="material-icons recipe-stonecut-icon">content_cut</span>
            </div>
            <span class="material-icons recipe-process-arrow">arrow_forward</span>
          </div>

          <div class="recipe-smelt-node">
            <div class="recipe-output-slot" title="${outputName} x${outputCount}">
              ${outputImg
                ? `<img class="recipe-slot-img" src="${outputImg}" alt="${outputName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none; font-size:26px;">inventory_2</span>`
                : `<span class="material-icons recipe-slot-fallback" style="font-size:26px;">inventory_2</span>`
              }
              ${outputCount > 1 ? `<span class="recipe-slot-qty">${outputCount}</span>` : ''}
            </div>
            <span class="recipe-smelt-label">Cut Result</span>
          </div>
        </div>
      `;
    } else {
      // Cartography / Generic Layout
      const input = (r.ingredients && r.ingredients[0]) || { name: 'Map / Paper', count: 1 };
      visualAreaHtml = `
        <div class="recipe-smelt-wrapper">
          <div class="recipe-smelt-node">
            <div class="recipe-grid-slot filled" title="${escapeHtml(input.name)}">
              ${input.image
                ? `<img class="recipe-slot-img" src="${input.image}" alt="${escapeHtml(input.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none;">map</span>`
                : `<span class="material-icons recipe-slot-fallback">map</span>`
              }
            </div>
            <span class="recipe-smelt-label">Map / Paper</span>
          </div>

          <div class="recipe-smelt-process">
            <div class="recipe-process-badge cartography">
              <span class="material-icons recipe-carto-icon">map</span>
            </div>
            <span class="material-icons recipe-process-arrow">arrow_forward</span>
          </div>

          <div class="recipe-smelt-node">
            <div class="recipe-output-slot" title="${outputName}">
              ${outputImg
                ? `<img class="recipe-slot-img" src="${outputImg}" alt="${outputName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                   <span class="material-icons recipe-slot-fallback" style="display:none; font-size:26px;">map</span>`
                : `<span class="material-icons recipe-slot-fallback" style="font-size:26px;">map</span>`
              }
            </div>
            <span class="recipe-smelt-label">Expanded</span>
          </div>
        </div>
      `;
    }

    // Ingredients chips
    const ingredientsHtml = (r.ingredients || []).map(ing => {
      const safeIngName = escapeHtml(ing.name || 'Material');
      const safeIngAttr = (ing.name || '').replace(/'/g, "\\'");
      return `
        <button type="button" class="recipe-ing-chip" onclick="window.filterByIngredient('${safeIngAttr}')" title="Filter recipes using ${safeIngName}">
          ${ing.image ? `<img class="recipe-ing-thumb" src="${ing.image}" alt="${safeIngName}" loading="lazy" onerror="this.style.display='none'">` : ''}
          <span class="recipe-ing-count">${ing.totalCount || ing.count || 1}x</span>
          <span>${safeIngName}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="recipe-card" data-id="${r.id}">
        <div class="recipe-card-header">
          <div class="recipe-station-badge ${stationClass}">
            <span class="material-icons" style="font-size:15px;">${stationIcon}</span>
            <span>${escapeHtml(r.stationName || 'Crafting Table')}</span>
          </div>
          <div class="recipe-card-actions">
            ${outputIdent ? `
              <button type="button" class="recipe-action-btn" title="Copy /give command" onclick="window.copyGiveCommand('${outputIdent}', ${outputCount})">
                <span class="material-icons" style="font-size:16px;">content_copy</span>
              </button>
              <a href="/items.html?search=${encodeURIComponent(r.name)}" class="recipe-action-btn" title="View in Items DB">
                <span class="material-icons" style="font-size:16px;">open_in_new</span>
              </a>
            ` : ''}
          </div>
        </div>

        <div class="recipe-card-body">
          <div class="recipe-visual-area">
            ${visualAreaHtml}
          </div>

          <div class="recipe-output-info">
            <h3 class="recipe-output-title">
              <span>${outputName}</span>
              ${outputCount > 1 ? `<span class="recipe-output-count-tag">x${outputCount}</span>` : ''}
            </h3>
            <span class="recipe-output-identifier">${outputIdent || escapeHtml(r.recipeId)}</span>
          </div>

          <div class="recipe-ingredients-wrap">
            <div class="recipe-ingredients-label">Required Ingredients</div>
            <div class="recipe-ingredients-chips">
              ${ingredientsHtml}
            </div>
          </div>
        </div>

        <div class="recipe-card-footer">
          <span class="recipe-id-pill" title="Recipe ID">${escapeHtml(r.recipeId || `#${r.id}`)}</span>
          ${outputIdent ? `
            <button type="button" class="recipe-give-cmd-btn" onclick="window.copyGiveCommand('${outputIdent}', ${outputCount})">
              <span class="material-icons" style="font-size:14px;">terminal</span>
              <span>/give</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Render Table View Row
  function renderTableRow(r) {
    const stationIcon = getStationIcon(r.block);
    const stationClass = `station-${r.block || 'crafting_table'}`;
    const outputName = escapeHtml(r.output?.name || r.name || 'Custom Item');
    const outputCount = r.output?.count || 1;
    const outputIdent = escapeHtml(r.output?.identifier || '');
    const outputImg = r.output?.image;

    const ingredientsHtml = (r.ingredients || []).map(ing => {
      const count = ing.totalCount || ing.count || 1;
      const name = escapeHtml(ing.name || 'Material');
      const safeIngAttr = (ing.name || '').replace(/'/g, "\\'");
      return `
        <span class="recipes-table-ing-badge" onclick="window.filterByIngredient('${safeIngAttr}')" title="Filter recipes using ${name}">
          ${ing.image ? `<img class="recipes-table-ing-img" src="${ing.image}" alt="${name}" loading="lazy" onerror="this.style.display='none'">` : ''}
          <strong class="recipes-table-ing-count">${count}x</strong>
          <span>${name}</span>
        </span>
      `;
    }).join(' ');

    return `
      <tr>
        <td class="recipes-table-icon-col">
          <div class="recipes-table-icon-box">
            ${outputImg
              ? `<img class="recipes-table-img" src="${outputImg}" alt="${outputName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                 <span class="material-icons" style="display:none; font-size:24px; color:#64748b;">inventory_2</span>`
              : `<span class="material-icons" style="font-size:24px; color:#64748b;">inventory_2</span>`
            }
          </div>
        </td>
        <td>
          <div class="recipes-table-item-name">
            <span>${outputName}</span>
            ${outputCount > 1 ? `<span class="recipes-table-qty-badge">x${outputCount}</span>` : ''}
          </div>
          <span class="recipes-table-item-id">${outputIdent}</span>
        </td>
        <td>
          <span class="recipe-station-badge ${stationClass}">
            <span class="material-icons" style="font-size:14px;">${stationIcon}</span>
            <span>${escapeHtml(r.stationName)}</span>
          </span>
        </td>
        <td class="recipes-table-ing-cell">
          <div class="recipes-table-ing-list">
            ${ingredientsHtml}
          </div>
        </td>
        <td>
          <span class="recipes-table-type-pill">
            ${r.block === 'crafting_table' ? `${r.width || 3}x${r.height || 3} Grid` : (r.stationName || 'Station')}
          </span>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <div class="recipes-table-actions">
            ${outputIdent ? `
              <button type="button" class="recipe-give-cmd-btn" onclick="window.copyGiveCommand('${outputIdent}', ${outputCount})" title="Copy /give command">
                <span class="material-icons" style="font-size:14px;">terminal</span>
                <span>/give</span>
              </button>
              <a href="/items.html?search=${encodeURIComponent(r.name)}" class="recipe-action-btn" title="View in Items DB" style="margin-left:4px;">
                <span class="material-icons" style="font-size:16px;">open_in_new</span>
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  // Render Pagination
  function renderPagination(totalItems) {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalItems / recipesPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '';

    // Prev Button
    html += `
      <button type="button" class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" title="Previous Page">
        <span class="material-icons" style="font-size:18px;">chevron_left</span>
      </button>
    `;

    // Page Numbers Calculation
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      html += `<button type="button" class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        html += `<span class="recipes-page-dots">&hellip;</span>`;
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      html += `
        <button type="button" class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">
          ${p}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="recipes-page-dots">&hellip;</span>`;
      }
      html += `<button type="button" class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next Button
    html += `
      <button type="button" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" title="Next Page">
        <span class="material-icons" style="font-size:18px;">chevron_right</span>
      </button>
    `;

    paginationContainer.innerHTML = html;

    // Attach click events
    paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (page && page !== currentPage && page >= 1 && page <= totalPages) {
          currentPage = page;
          renderResults();
          const target = document.querySelector('.recipes-toolbar') || document.getElementById('main-content');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Search input with debounce
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = e.target.value.toLowerCase().trim();
          if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
          }
          currentPage = 1;
          applyFilters();
        }, 150);
      });
    }

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        selectedStation = 'all';
        sortBy = 'default';
        if (stationSelect) stationSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'default';
        clearSearchBtn.style.display = 'none';
        updateActiveChips();
        currentPage = 1;
        applyFilters();
      });
    }

    // Station Select Dropdown
    if (stationSelect) {
      stationSelect.addEventListener('change', (e) => {
        selectedStation = e.target.value;
        updateActiveChips();
        currentPage = 1;
        applyFilters();
      });
    }

    // Sort Select Dropdown
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        currentPage = 1;
        applyFilters();
      });
    }

    // View Mode Toggles
    if (gridViewBtn && listViewBtn) {
      gridViewBtn.addEventListener('click', () => {
        if (viewMode === 'grid') return;
        viewMode = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        renderResults();
      });

      listViewBtn.addEventListener('click', () => {
        if (viewMode === 'list') return;
        viewMode = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        renderResults();
      });
    }

    // URL Query Params Check on Init
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get('search') || params.get('q') || params.get('item');
      const urlStation = params.get('station');

      if (urlSearch && searchInput) {
        searchInput.value = urlSearch;
        searchQuery = urlSearch.toLowerCase().trim();
        if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
      }

      if (urlStation && STATIONS.some(s => s.id === urlStation)) {
        selectedStation = urlStation;
        if (stationSelect) stationSelect.value = urlStation;
      }
    } catch (e) {
      console.warn('Failed parsing query params:', e);
    }
  }

  // Initial Load
  async function init() {
    setupEventListeners();

    try {
      if (resultsCounter) {
        resultsCounter.textContent = 'Loading recipes database...';
      }

      const res = await fetch('data/recipes-index.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allRecipes = await res.json();

      updateHeroStats();
      renderFilterChips();
      updateActiveChips();
      applyFilters();
    } catch (err) {
      console.error('Failed to load recipes data:', err);
      if (resultsCounter) {
        resultsCounter.innerHTML = `<span style="color:#ef4444;">Failed to load recipes database. Please refresh.</span>`;
      }
      if (emptyState) {
        emptyState.style.display = 'flex';
        const title = emptyState.querySelector('.recipes-empty-title');
        const desc = emptyState.querySelector('.recipes-empty-desc');
        if (title) title.textContent = 'Error Loading Recipes';
        if (desc) desc.textContent = 'Could not load recipes-index.json. Please check your connection or reload the page.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

