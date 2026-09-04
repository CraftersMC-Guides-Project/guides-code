/**
 * CraftersMC Guides — Leaderboard Modern Theme Helper
 * Provides unified player avatar rendering, rank styling, and responsive category management.
 */

(function (window) {
  'use strict';

  function formatRankBadge(rank) {
    const num = parseInt(rank, 10);
    if (num === 1) return '<span class="rank-badge rank-1">1</span>';
    if (num === 2) return '<span class="rank-badge rank-2">2</span>';
    if (num === 3) return '<span class="rank-badge rank-3">3</span>';
    return `<span class="rank-badge rank-other">${rank || '-'}</span>`;
  }

  function createPlayerCell(name) {
    if (!name || name === "???") {
      return '<td><span class="player-cell" style="color:var(--text-muted);">???</span></td>';
    }
    const cleanName = String(name).replace(/§[0-9a-fk-or]/gi, '').trim();
    return `
      <td>
        <div class="player-cell">
          <img class="player-avatar" src="https://mc-heads.net/avatar/${encodeURIComponent(cleanName)}/28" alt="${cleanName}" onerror="this.onerror=null;this.src='../assets/cmc-icon.png';">
          <a href="../player.html?player=${encodeURIComponent(cleanName)}" class="player-name-link" title="View Profile">${cleanName}</a>
        </div>
      </td>
    `;
  }

  window.formatRankBadge = formatRankBadge;
  window.createPlayerCell = createPlayerCell;

})(window);
