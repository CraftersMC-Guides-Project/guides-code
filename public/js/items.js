/**
 * CraftersMC Items Directory Controller
 * Handles loading, high-performance filtering, sorting, pagination, and modal display for 3,500+ items.
 */

(function () {
  'use strict';

  // State
  let allItems = [];
  let filteredItems = [];
  let currentPage = 1;
  const itemsPerPage = 48;
  let viewMode = 'grid'; // 'grid' or 'list'
  let searchQuery = '';
  let selectedCategory = 'all';
  let selectedNamespace = 'all';
  let sortBy = 'default'; // 'default', 'id-asc', 'id-desc', 'name-asc', 'name-desc'
  let onlyWithImages = false;

  // DOM Elements
  const searchInput = document.getElementById('itemSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const namespaceSelect = document.getElementById('namespaceSelect');
  const sortSelect = document.getElementById('sortSelect');
  const filterChipsContainer = document.getElementById('filterChips');
  const gridContainer = document.getElementById('itemsGrid');
  const listContainer = document.getElementById('itemsList');
  const paginationContainer = document.getElementById('itemsPagination');
  const emptyState = document.getElementById('emptyState');
  const resultsCounter = document.getElementById('resultsCounter');
  const activeFiltersDesc = document.getElementById('activeFiltersDesc');
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');

  // Modal Elements
  const modalOverlay = document.getElementById('itemModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalImg = document.getElementById('modalImg');
  const modalFallback = document.getElementById('modalFallback');
  const modalIdentifier = document.getElementById('modalIdentifier');
  const modalNumericId = document.getElementById('modalNumericId');
  const modalNamespace = document.getElementById('modalNamespace');
  const modalCategory = document.getElementById('modalCategory');
  const modalCopyIdBtn = document.getElementById('modalCopyIdBtn');
  const modalCopyGiveBtn = document.getElementById('modalCopyGiveBtn');
  const modalAuctionLink = document.getElementById('modalAuctionLink');
  const modalBazaarLink = document.getElementById('modalBazaarLink');
  const toast = document.getElementById('itemToast');
  const toastText = document.getElementById('itemToastText');

  let activeModalItem = null;

  // Category Icon Map
  const categoryIcons = {
    all: 'grid_view',
    weapons: 'sports_kabaddi',
    armor: 'shield',
    tools: 'build',
    minions: 'precision_manufacturing',
    accessories: 'diamond',
    pets: 'pets',
    materials: 'auto_awesome',
    blocks: 'inventory_2',
    special: 'cake',
    items: 'category',
    ui: 'widgets'
  };

  // Toast Function
  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  // Copy to clipboard
  async function copyToClipboard(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg || 'Copied to clipboard!');
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg || 'Copied to clipboard!');
    }
  }

  // Fallback Icon resolver based on category
  function getCategoryFallbackIcon(cat) {
    switch (cat) {
      case 'weapons': return 'military_tech';
      case 'armor': return 'shield';
      case 'tools': return 'construction';
      case 'minions': return 'smart_toy';
      case 'accessories': return 'stars';
      case 'pets': return 'pets';
      case 'materials': return 'auto_awesome';
      case 'blocks': return 'view_in_ar';
      case 'special': return 'card_giftcard';
      case 'ui': return 'aspect_ratio';
      default: return 'inventory';
    }
  }

  // Fetch Items Data
  async function loadItems() {
    try {
      const res = await fetch('/data/craftersmc-items.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allItems = data.items || [];

      // Update hero stat pills
      const totalCountEl = document.getElementById('heroTotalCount');
      const trpixelCountEl = document.getElementById('heroTrpixelCount');
      const mcCountEl = document.getElementById('heroMcCount');

      if (totalCountEl) totalCountEl.textContent = allItems.length.toLocaleString();
      if (trpixelCountEl) {
        const trpCount = allItems.filter(i => i.namespace === 'trpixel').length;
        trpixelCountEl.textContent = trpCount.toLocaleString();
      }
      if (mcCountEl) {
        const mcCount = allItems.filter(i => i.namespace === 'minecraft').length;
        mcCountEl.textContent = mcCount.toLocaleString();
      }

      buildCategoryChips();
      applyFilters();
    } catch (err) {
      console.error('Failed to load CraftersMC items:', err);
      if (resultsCounter) resultsCounter.innerHTML = `<span style="color:#ef4444;">Failed to load items database.</span>`;
    }
  }

  // Build Category Chips with Live Counts
  function buildCategoryChips() {
    if (!filterChipsContainer) return;

    // Count categories
    const counts = { all: allItems.length };
    allItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    const categories = [
      { id: 'all', label: 'All Items' },
      { id: 'weapons', label: 'Weapons' },
      { id: 'armor', label: 'Armor & Sets' },
      { id: 'minions', label: 'Minions' },
      { id: 'accessories', label: 'Accessories' },
      { id: 'pets', label: 'Pets & Items' },
      { id: 'tools', label: 'Tools' },
      { id: 'materials', label: 'Materials & Drops' },
      { id: 'blocks', label: 'Blocks' },
      { id: 'special', label: 'Specials & Custom' },
      { id: 'items', label: 'General Items' },
      { id: 'ui', label: 'UI & System' }
    ];

    filterChipsContainer.innerHTML = categories.map(cat => {
      const icon = categoryIcons[cat.id] || 'label';
      const count = counts[cat.id] || 0;
      const isActive = selectedCategory === cat.id ? 'active' : '';
      return `
        <button type="button" class="filter-chip ${isActive}" data-category="${cat.id}">
          <span class="material-icons" style="font-size:14px;">${icon}</span>
          ${cat.label}
          <span class="chip-count">${count.toLocaleString()}</span>
        </button>
      `;
    }).join('');

    // Attach click events
    filterChipsContainer.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        filterChipsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.category;
        currentPage = 1;
        applyFilters();
      });
    });
  }

  // Apply Search, Filter, Sort
  function applyFilters() {
    const q = searchQuery.toLowerCase().trim();

    filteredItems = allItems.filter(item => {
      // Namespace filter
      if (selectedNamespace !== 'all' && item.namespace !== selectedNamespace) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Only with image filter
      if (onlyWithImages && !item.image) {
        return false;
      }

      // Search Query
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchIdent = item.identifier.toLowerCase().includes(q);
        const matchId = String(item.numericId) === q || item.idStr === q;
        const matchPure = item.identifier.replace(/^(minecraft|trpixel):/i, '').toLowerCase().includes(q);
        if (!matchName && !matchIdent && !matchId && !matchPure) {
          return false;
        }
      }

      return true;
    });

    // Sort
    sortItems(filteredItems);

    // Update Counter & Active Filter labels
    updateStatusBar();

    // Render View
    renderCurrentPage();
  }

  // Sort
  function sortItems(list) {
    switch (sortBy) {
      case 'id-asc':
        list.sort((a, b) => a.numericId - b.numericId);
        break;
      case 'id-desc':
        list.sort((a, b) => b.numericId - a.numericId);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
      default:
        // Trpixel first, then numericId
        list.sort((a, b) => {
          if (a.namespace !== b.namespace) {
            if (a.namespace === 'trpixel') return -1;
            if (b.namespace === 'trpixel') return 1;
          }
          return a.numericId - b.numericId;
        });
        break;
    }
  }

  // Status Bar update
  function updateStatusBar() {
    if (resultsCounter) {
      resultsCounter.innerHTML = `Showing <span>${filteredItems.length.toLocaleString()}</span> of <span>${allItems.length.toLocaleString()}</span> items`;
    }

    if (activeFiltersDesc) {
      const parts = [];
      if (searchQuery) parts.push(`matching "${searchQuery}"`);
      if (selectedCategory !== 'all') parts.push(`in ${selectedCategory}`);
      if (selectedNamespace !== 'all') parts.push(`from ${selectedNamespace}`);
      if (onlyWithImages) parts.push('with textures');

      if (parts.length > 0) {
        activeFiltersDesc.innerHTML = `<span class="material-icons" style="font-size:14px;">filter_alt</span> ${parts.join(' • ')}`;
        activeFiltersDesc.style.display = 'inline-flex';
      } else {
        activeFiltersDesc.style.display = 'none';
      }
    }
  }

  // Render Page Content
  function renderCurrentPage() {
    const totalItems = filteredItems.length;

    if (totalItems === 0) {
      if (gridContainer) gridContainer.style.display = 'none';
      if (listContainer) listContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Calculate Slice
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, totalItems);
    const pageItems = filteredItems.slice(startIdx, endIdx);

    if (viewMode === 'grid') {
      if (listContainer) listContainer.style.display = 'none';
      if (gridContainer) {
        gridContainer.style.display = 'grid';
        renderGrid(pageItems);
      }
    } else {
      if (gridContainer) gridContainer.style.display = 'none';
      if (listContainer) {
        listContainer.style.display = 'block';
        renderList(pageItems);
      }
    }

    renderPagination(totalPages);
  }

  // Render Grid Cards
  function renderGrid(items) {
    gridContainer.innerHTML = items.map(item => {
      const isTrpixel = item.namespace === 'trpixel';
      const badgeClass = isTrpixel ? 'trpixel' : 'minecraft';
      const fallbackIcon = getCategoryFallbackIcon(item.category);

      return `
        <div class="item-card" data-id="${item.numericId}">
          <div class="item-card-header">
            <span class="item-id-pill">#${item.numericId}</span>
            <span class="item-badge-namespace ${badgeClass}">${item.namespace}</span>
          </div>
          
          <div class="item-slot-wrapper">
            ${item.image
              ? `<img class="item-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <span class="material-icons item-fallback-icon" style="display:none;">${fallbackIcon}</span>`
              : `<span class="material-icons item-fallback-icon">${fallbackIcon}</span>`
            }
          </div>

          <div class="item-card-body">
            <h4 class="item-card-title">${item.name}</h4>
            <span class="item-identifier-code">${item.identifier}</span>
          </div>

          <div class="item-card-footer">
            <span class="item-cat-label">${item.categoryName}</span>
            <button type="button" class="item-copy-btn" title="Copy Item ID (${item.identifier})" onclick="event.stopPropagation(); window.copyItemId('${item.identifier}')">
              <span class="material-icons" style="font-size:15px;">content_copy</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click for opening modal
    gridContainer.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id, 10);
        const item = allItems.find(i => i.numericId === id);
        if (item) openModal(item);
      });
    });
  }

  // Render List Table
  function renderList(items) {
    const tableBody = document.getElementById('itemsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = items.map(item => {
      const isTrpixel = item.namespace === 'trpixel';
      const badgeClass = isTrpixel ? 'trpixel' : 'minecraft';
      const fallbackIcon = getCategoryFallbackIcon(item.category);

      return `
        <tr data-id="${item.numericId}">
          <td class="items-table-icon-col">
            ${item.image
              ? `<img class="items-table-img" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                 <span class="material-icons" style="display:none; font-size:22px; color:var(--text-muted);">${fallbackIcon}</span>`
              : `<span class="material-icons" style="font-size:22px; color:var(--text-muted);">${fallbackIcon}</span>`
            }
          </td>
          <td><strong>${item.name}</strong></td>
          <td><code style="font-family:'JetBrains Mono',monospace; font-size:0.8rem;">${item.identifier}</code></td>
          <td><span class="item-id-pill">#${item.numericId}</span></td>
          <td><span class="item-badge-namespace ${badgeClass}">${item.namespace}</span></td>
          <td><span class="item-cat-label">${item.categoryName}</span></td>
          <td style="text-align:right;">
            <button type="button" class="item-copy-btn" title="Copy Item ID" onclick="event.stopPropagation(); window.copyItemId('${item.identifier}')">
              <span class="material-icons" style="font-size:15px;">content_copy</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const id = parseInt(row.dataset.id, 10);
        const item = allItems.find(i => i.numericId === id);
        if (item) openModal(item);
      });
    });
  }

  // Render Pagination
  function renderPagination(totalPages) {
    if (!paginationContainer || totalPages <= 1) {
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    let html = '';

    // Prev Button
    html += `
      <button type="button" class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.goToItemsPage(${currentPage - 1})">
        <span class="material-icons" style="font-size:16px;">chevron_left</span> Prev
      </button>
    `;

    // Max 7 page buttons
    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      html += `<button type="button" class="page-btn" onclick="window.goToItemsPage(1)">1</button>`;
      if (startPage > 2) html += `<span style="padding:0 4px; font-weight:800;">...</span>`;
    }

    for (let p = startPage; p <= endPage; p++) {
      html += `
        <button type="button" class="page-btn ${p === currentPage ? 'active' : ''}" onclick="window.goToItemsPage(${p})">
          ${p}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span style="padding:0 4px; font-weight:800;">...</span>`;
      html += `<button type="button" class="page-btn" onclick="window.goToItemsPage(${totalPages})">${totalPages}</button>`;
    }

    // Next Button
    html += `
      <button type="button" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.goToItemsPage(${currentPage + 1})">
        Next <span class="material-icons" style="font-size:16px;">chevron_right</span>
      </button>
    `;

    paginationContainer.innerHTML = html;
  }

  // Global Page jump
  window.goToItemsPage = function (p) {
    currentPage = p;
    renderCurrentPage();
    window.scrollTo({ top: document.querySelector('.items-toolbar')?.offsetTop - 80 || 0, behavior: 'smooth' });
  };

  // Global Copy ID function
  window.copyItemId = function (ident) {
    copyToClipboard(ident, `Copied ${ident}`);
  };

  // Open Modal Item Inspector
  function openModal(item) {
    activeModalItem = item;
    if (!modalOverlay) return;

    if (modalTitle) modalTitle.textContent = item.name;
    if (modalIdentifier) modalIdentifier.textContent = item.identifier;
    if (modalNumericId) modalNumericId.textContent = `#${item.numericId}`;
    if (modalNamespace) {
      modalNamespace.textContent = item.namespace;
      modalNamespace.className = `item-badge-namespace ${item.namespace === 'trpixel' ? 'trpixel' : 'minecraft'}`;
    }
    if (modalCategory) modalCategory.textContent = item.categoryName;

    // Image / Fallback
    const fallbackIcon = getCategoryFallbackIcon(item.category);
    if (item.image) {
      if (modalImg) {
        modalImg.src = item.image;
        modalImg.style.display = 'block';
        modalImg.onerror = () => {
          modalImg.style.display = 'none';
          if (modalFallback) {
            modalFallback.textContent = fallbackIcon;
            modalFallback.style.display = 'block';
          }
        };
      }
      if (modalFallback) modalFallback.style.display = 'none';
    } else {
      if (modalImg) modalImg.style.display = 'none';
      if (modalFallback) {
        modalFallback.textContent = fallbackIcon;
        modalFallback.style.display = 'block';
      }
    }

    // Auction & Bazaar quick search links
    const cleanSearchTerm = encodeURIComponent(item.name.replace(/\s+Minion.*$/i, '').trim());
    if (modalAuctionLink) {
      modalAuctionLink.href = `/auction.html?search=${cleanSearchTerm}`;
    }
    if (modalBazaarLink) {
      modalBazaarLink.href = `/bazaar.html?search=${cleanSearchTerm}`;
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    activeModalItem = null;
  }

  // Event Listeners
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
      }
      debounceTimer = setTimeout(() => {
        currentPage = 1;
        applyFilters();
      }, 150);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      currentPage = 1;
      applyFilters();
      searchInput.focus();
    });
  }

  if (namespaceSelect) {
    namespaceSelect.addEventListener('change', (e) => {
      selectedNamespace = e.target.value;
      currentPage = 1;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      applyFilters();
    });
  }

  if (gridViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      viewMode = 'grid';
      gridViewBtn.classList.add('active');
      if (listViewBtn) listViewBtn.classList.remove('active');
      renderCurrentPage();
    });
  }

  if (listViewBtn) {
    listViewBtn.addEventListener('click', () => {
      viewMode = 'list';
      listViewBtn.classList.add('active');
      if (gridViewBtn) gridViewBtn.classList.remove('active');
      renderCurrentPage();
    });
  }

  // Modal Actions
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  if (modalCopyIdBtn) {
    modalCopyIdBtn.addEventListener('click', () => {
      if (activeModalItem) {
        copyToClipboard(activeModalItem.identifier, `Copied ${activeModalItem.identifier}`);
      }
    });
  }

  if (modalCopyGiveBtn) {
    modalCopyGiveBtn.addEventListener('click', () => {
      if (activeModalItem) {
        const cmd = `/give @p ${activeModalItem.identifier} 1`;
        copyToClipboard(cmd, `Copied give command: ${cmd}`);
      }
    });
  }

  // URL Query param initialization (e.g. ?search=sword or ?category=weapons)
  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('search');
    const catParam = params.get('category');
    const nsParam = params.get('namespace');

    if (qParam && searchInput) {
      searchInput.value = qParam;
      searchQuery = qParam;
      if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
    }
    if (catParam) {
      selectedCategory = catParam;
    }
    if (nsParam && namespaceSelect) {
      selectedNamespace = nsParam;
      namespaceSelect.value = nsParam;
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    handleUrlParams();
    loadItems();
  });

})();

