/**
 * Texture Packs Controller (Neo-Brutalism Theme)
 * Manages verified download modal confirmations, real-time live search, and category filtering.
 */

let currentFilter = 'all';
let currentSearch = '';

/**
 * Open Download Confirmation Modal
 * @param {string} file - Target download URL
 * @param {string} packName - Display name of the texture pack
 */
function showDownloadPanel(file, packName) {
  const confirmBtn = document.getElementById('confirmDownloadBtn');
  const nameEl = document.getElementById('modalPackName');

  if (nameEl) {
    nameEl.textContent = packName || 'Resource Pack';
  }

  if (confirmBtn) {
    confirmBtn.onclick = function () {
      window.open(file, '_blank', 'noopener,noreferrer');
      closeDownloadPanel();
    };
  }

  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.add('texture-show');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close Download Confirmation Modal
 */
function closeDownloadPanel() {
  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.remove('texture-show');
    document.body.style.overflow = '';
  }
}

// Close modal on Escape key press
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeDownloadPanel();
  }
});

/**
 * Filter packs by category chip
 * @param {string} category - 'all', 'fps', 'pvp', 'visual', or 'utility'
 * @param {HTMLElement} btn - The clicked chip element
 */
function filterPacks(category, btn) {
  currentFilter = category;
  document.querySelectorAll('.filter-chip-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  }
  applyFilters();
}

/**
 * Filter packs by search query
 * @param {string} query
 */
function handleSearch(query) {
  currentSearch = (query || '').toLowerCase().trim();
  applyFilters();
}

/**
 * Apply both active category and search query filters across all pack cards
 */
function applyFilters() {
  const cards = document.querySelectorAll('.texture-pack-card');
  const emptyState = document.getElementById('packsEmptyState');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    const title = (card.querySelector('.pack-title')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('.pack-desc')?.textContent || '').toLowerCase();
    const tags = (card.querySelector('.pack-meta-tags')?.textContent || '').toLowerCase();

    const matchesCat = (currentFilter === 'all' || cardCat === currentFilter);
    const matchesSearch = (!currentSearch || title.includes(currentSearch) || desc.includes(currentSearch) || tags.includes(currentSearch));

    if (matchesCat && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
  }

  const countBadge = document.getElementById('visiblePacksCount');
  if (countBadge) {
    countBadge.textContent = `Showing ${visibleCount} of ${cards.length} packs`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('packSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }
});
