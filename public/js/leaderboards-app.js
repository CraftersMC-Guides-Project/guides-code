/**
 * CraftersMC Guides — Unified Leaderboards Application
 * Connects to /api/leaderboards/... proxy with Cloudflare Pages Functions
 */

(function () {
  "use strict";

  // Category Configuration from leaderboards-config.js
  const CONFIG = window.CATEGORIES_CONFIG || { categories: {}, collections: {} };

  // 12-category hierarchical taxonomy matching Feather-Bot
  const SECTIONS = (CONFIG.hierarchy && Array.isArray(CONFIG.hierarchy) && CONFIG.hierarchy.length > 0)
    ? CONFIG.hierarchy
    : [
        {
          num: 1,
          id: "combat",
          name: "Combat",
          icon: "sports_kabaddi",
          categories: ["boss-kills", "slayer"]
        },
        {
          num: 2,
          id: "kills",
          name: "Kills",
          icon: "pest_control",
          categories: ["kills"]
        },
        {
          num: 3,
          id: "collections",
          name: "Collections",
          icon: "inventory_2",
          isCollection: true,
          subCats: ["farming", "mining", "combat", "foraging"]
        },
        {
          num: 4,
          id: "skills",
          name: "Skills",
          icon: "trending_up",
          categories: ["skills"]
        },
        {
          num: 5,
          id: "mining",
          name: "Mining Milestone",
          icon: "construction",
          categories: ["miningmilestone"]
        },
        {
          num: 6,
          id: "races",
          name: "Races",
          icon: "timer",
          categories: ["races"]
        },
        {
          num: 7,
          id: "quests",
          name: "Quests",
          icon: "assignment",
          categories: ["daily-quests"]
        },
        {
          num: 8,
          id: "events",
          name: "Events",
          icon: "celebration",
          categories: ["farming-contests", "farming-bests", "shiny-pigs", "spooky-festival"]
        },
        {
          num: 9,
          id: "summoning",
          name: "Summoning",
          icon: "visibility",
          categories: ["summoning-eyes"]
        },
        {
          num: 10,
          id: "network-stats",
          name: "Network Stats",
          icon: "hub",
          categories: ["network-coins", "network-exp"]
        },
        {
          num: 11,
          id: "superpairs",
          name: "Superpairs",
          icon: "casino",
          categories: ["superpairs"]
        },
        {
          num: 12,
          id: "profile",
          name: "Profile",
          icon: "account_circle",
          categories: ["networth", "total-playtime", "skyblock-level", "crafters-level", "damage", "crit-damage"]
        }
      ];

  // Profile Colors for cute Fruit profiles
  const PROFILE_COLORS = {
    APPLE: { bg: "#fee2e2", text: "#b91c1c", border: "#f87171" },
    BANANA: { bg: "#fef9c3", text: "#854d0e", border: "#facc15" },
    BLUEBERRY: { bg: "#dbeafe", text: "#1d4ed8", border: "#60a5fa" },
    CHERRY: { bg: "#ffe4e6", text: "#be123c", border: "#fb7185" },
    COCONUT: { bg: "#f4f4f5", text: "#3f3f46", border: "#a1a1aa" },
    CUCUMBER: { bg: "#dcfce7", text: "#15803d", border: "#4ade80" },
    GRAPES: { bg: "#f3e8ff", text: "#6b21a8", border: "#c084fc" },
    KIWI: { bg: "#ecfccb", text: "#3f6212", border: "#a3e635" },
    LEMON: { bg: "#fef08a", text: "#713f12", border: "#eab308" },
    LIME: { bg: "#d1fae5", text: "#065f46", border: "#34d399" },
    MANGO: { bg: "#ffedd5", text: "#c2410c", border: "#fb923c" },
    ORANGE: { bg: "#fed7aa", text: "#9a3412", border: "#f97316" },
    PAPAYA: { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
    PEACH: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    PEAR: { bg: "#f7fee7", text: "#365314", border: "#bef264" },
    PINEAPPLE: { bg: "#fef08a", text: "#854d0e", border: "#fde047" },
    POMEGRANATE: { bg: "#ffe4e6", text: "#9f1239", border: "#f43f5e" },
    RASPBERRY: { bg: "#fce7f3", text: "#9d174d", border: "#f472b6" },
    STRAWBERRY: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
    TOMATO: { bg: "#fecaca", text: "#991b1b", border: "#ef4444" },
    WATERMELON: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
    ZUCCHINI: { bg: "#ecfdf5", text: "#047857", border: "#10b981" }
  };

  // State
  const state = {
    sectionId: "skills-progression",
    categoryKey: "skills",
    subCatKey: null,
    itemSlug: "combat",
    itemName: "Combat",
    scoreLabel: "XP",
    allPlayers: [],
    filteredPlayers: [],
    loading: false,
    error: null,
    searchFilter: "",
    pageSize: 50,
    currentPage: 1,
    lastUpdatedText: "",
    totalCount: 0
  };

  // Dataset cache: key -> data object
  const datasetCache = new Map();

  // Helper: clean display names (strip Trpixel: or other prefixes)
  function cleanItemName(name) {
    if (!name) return "";
    return name.replace(/^Trpixel:\s*/i, "").trim();
  }

  // Helper: Format numbers
  function formatNumber(num) {
    if (typeof num !== "number") return num;
    return num.toLocaleString("en-US");
  }

  // Helper: Compact notation for huge numbers (e.g. 590.4M, 1.2B)
  function compactNumber(num) {
    if (typeof num !== "number" || isNaN(num)) return "";
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
    }
    if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
    }
    if (Math.abs(num) >= 1e3) {
      return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return "";
  }

  // Helper: Format race ms string or numbers to MM:SS.ms
  function formatScore(score, isRace) {
    if (score == null) return "0";

    // Check if score is race time string (e.g. "13600 ms" or "0 ms")
    if (typeof score === "string" && score.toLowerCase().includes("ms")) {
      const ms = parseInt(score.replace(/[^0-9]/g, ""), 10);
      if (isNaN(ms) || ms === 0) return "0.000s";
      const totalSec = ms / 1000;
      const mins = Math.floor(totalSec / 60);
      const remainingSec = (totalSec % 60).toFixed(3);
      if (mins > 0) {
        return `${mins}m ${remainingSec < 10 ? "0" : ""}${remainingSec}s`;
      }
      return `${remainingSec}s`;
    }

    if (isRace && typeof score === "number") {
      const totalSec = score / 1000;
      const mins = Math.floor(totalSec / 60);
      const remainingSec = (totalSec % 60).toFixed(3);
      if (mins > 0) {
        return `${mins}m ${remainingSec < 10 ? "0" : ""}${remainingSec}s`;
      }
      return `${remainingSec}s`;
    }

    if (typeof score === "number") {
      const full = formatNumber(Math.round(score * 100) / 100);
      const compact = compactNumber(score);
      if (compact && Math.abs(score) >= 100000) {
        return `${full} <span class="score-compact">(${compact})</span>`;
      }
      return full;
    }

    return String(score);
  }

  // Get item definition from CONFIG
  function resolveTargetItem(catKey, subCat, itemSlug) {
    if (catKey === "collections" && subCat && CONFIG.collections?.[subCat]) {
      const items = CONFIG.collections[subCat].items || [];
      const matched = items.find((i) => i.slug.toLowerCase() === itemSlug.toLowerCase()) || items[0];
      return {
        isCollection: true,
        categoryKey: "collections",
        subCatKey: subCat,
        categoryName: CONFIG.collections[subCat].name,
        item: matched,
        items
      };
    }

    if (CONFIG.categories?.[catKey]) {
      const items = CONFIG.categories[catKey].items || [];
      const matched = items.find((i) => i.slug.toLowerCase() === (itemSlug || "").toLowerCase()) || items[0];
      return {
        isCollection: false,
        categoryKey: catKey,
        subCatKey: null,
        categoryName: CONFIG.categories[catKey].name,
        item: matched,
        items
      };
    }

    // Default fallback to skills/combat
    const fallbackItems = CONFIG.categories?.skills?.items || [];
    return {
      isCollection: false,
      categoryKey: "skills",
      subCatKey: null,
      categoryName: "Skills",
      item: fallbackItems.find((i) => i.slug === "combat") || fallbackItems[0] || { slug: "combat", name: "Combat", scoreLabel: "XP" },
      items: fallbackItems
    };
  }

  // Determine which High-Level Section contains this category
  function findSectionForCategory(catKey) {
    if (catKey === "collections") return "collections";
    for (const sec of SECTIONS) {
      if (sec.id === catKey) return sec.id;
      if (sec.categories && sec.categories.includes(catKey)) {
        return sec.id;
      }
    }
    return "skills";
  }

  // Parse location.hash
  // Supported patterns:
  // #collections/mining/diamond
  // #skills/combat
  // #combat/boss-kills/superior-dragon
  // #events/spooky-festival/14
  // #networth
  // #boss-kills/superior-dragon
  function parseRouteFromHash() {
    const hash = window.location.hash.replace(/^#\/?/, "").trim();
    if (!hash) {
      return { catKey: "skills", subCat: null, itemSlug: "combat" };
    }

    const legacySectionMap = {
      "skills-progression": "skills",
      "slayers-combat": "combat",
      "economy-wealth": "profile",
      "races-speedruns": "races",
      "events-milestones": "events"
    };

    const parts = hash.split("/").map(decodeURIComponent).map((p) => p.trim());
    let [first, second, third] = parts;

    if (legacySectionMap[first]) {
      first = legacySectionMap[first];
    }

    // Direct collection shortcut (e.g. #collections/mining/diamond)
    if (first === "collections") {
      const subCat = second || "farming";
      const itemSlug = third || (CONFIG.collections?.[subCat]?.items?.[0]?.slug || "wheat");
      return { catKey: "collections", subCat, itemSlug };
    }

    if (CONFIG.collections?.[first]) {
      const subCat = first;
      const itemSlug = second || (CONFIG.collections[subCat]?.items?.[0]?.slug || "wheat");
      return { catKey: "collections", subCat, itemSlug };
    }

    // Check if first is a Section ID (e.g. #combat/boss-kills/superior-dragon or #events/spooky-festival/12)
    const matchedSec = SECTIONS.find((s) => s.id === first);
    if (matchedSec) {
      if (second && CONFIG.categories?.[second]) {
        const catKey = second;
        const itemSlug = third || (CONFIG.categories[catKey]?.items?.[0]?.slug || catKey);
        return { catKey, subCat: null, itemSlug };
      }
      const defaultCat = matchedSec.categories ? matchedSec.categories[0] : first;
      const catObj = CONFIG.categories?.[defaultCat];
      if (catObj) {
        const itemSlug = second || (catObj.items?.[0]?.slug || defaultCat);
        return { catKey: defaultCat, subCat: null, itemSlug };
      }
    }

    // Check if first is direct category key (e.g. #boss-kills/superior-dragon or #networth)
    if (CONFIG.categories?.[first]) {
      const catKey = first;
      const itemSlug = second || (CONFIG.categories[catKey]?.items?.[0]?.slug || catKey);
      return { catKey, subCat: null, itemSlug };
    }

    return { catKey: "skills", subCat: null, itemSlug: "combat" };
  }

  // Set location.hash without triggering infinite loops
  function setRouteHash(catKey, subCat, itemSlug) {
    let newHash = "";
    if (catKey === "collections") {
      newHash = `#collections/${subCat}/${itemSlug}`;
    } else {
      const secId = findSectionForCategory(catKey);
      if (secId && secId !== catKey) {
        newHash = `#${secId}/${catKey}/${itemSlug}`;
      } else if (itemSlug && itemSlug !== catKey) {
        newHash = `#${catKey}/${itemSlug}`;
      } else {
        newHash = `#${catKey}`;
      }
    }

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  }

  // Build API endpoint URL
  function buildApiUrl(catKey, subCat, itemSlug) {
    if (catKey === "collections") {
      return `/api/leaderboards/collections/${encodeURIComponent(subCat)}/${encodeURIComponent(itemSlug)}`;
    }
    return `/api/leaderboards/${encodeURIComponent(catKey)}/${encodeURIComponent(itemSlug)}`;
  }

  // Fetch Leaderboard Dataset via Cloudflare Pages API Proxy
  async function fetchLeaderboard(catKey, subCat, itemSlug) {
    const cacheKey = catKey === "collections" ? `collections:${subCat}:${itemSlug}` : `${catKey}:${itemSlug}`;

    if (datasetCache.has(cacheKey)) {
      return datasetCache.get(cacheKey);
    }

    const primaryUrl = buildApiUrl(catKey, subCat, itemSlug);
    const res = await fetch(primaryUrl, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `Proxy responded with status ${res.status}`);
    }

    const json = await res.json();
    if (!json || json.ok === false) {
      throw new Error(json?.error || "Invalid response from server");
    }

    datasetCache.set(cacheKey, json);
    return json;
  }

  // RENDER: High Level Section Tabs
  function renderSectionTabs() {
    const container = document.getElementById("lbSectionTabs");
    if (!container) return;

    container.innerHTML = SECTIONS.map((sec) => {
      const isActive = sec.id === state.sectionId;
      return `
        <button type="button" class="lb-section-pill ${isActive ? "active" : ""}" data-section="${sec.id}">
          <span class="material-icons">${sec.icon}</span>
          <span>${sec.name}</span>
        </button>
      `;
    }).join("");

    container.querySelectorAll(".lb-section-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const secId = btn.getAttribute("data-section");
        onSelectSection(secId);
      });
    });
  }

  // Handler: When high-level section is clicked
  function onSelectSection(secId) {
    state.sectionId = secId;
    const sec = SECTIONS.find((s) => s.id === secId);
    if (!sec) return;

    if (sec.isCollection) {
      state.categoryKey = "collections";
      state.subCatKey = sec.subCats[0] || "farming";
      const items = CONFIG.collections?.[state.subCatKey]?.items || [];
      state.itemSlug = items[0]?.slug || "wheat";
    } else {
      state.categoryKey = sec.categories[0];
      state.subCatKey = null;
      const items = CONFIG.categories?.[state.categoryKey]?.items || [];
      state.itemSlug = items[0]?.slug || state.categoryKey;
    }

    setRouteHash(state.categoryKey, state.subCatKey, state.itemSlug);
    loadCurrentLeaderboard();
  }

  // RENDER: Secondary Categories & Sub-items
  function renderSubNavigation() {
    const sec = SECTIONS.find((s) => s.id === state.sectionId);
    if (!sec) return;

    const catContainer = document.getElementById("lbCategoryPills");
    const itemContainer = document.getElementById("lbItemPills");
    const itemFilterWrap = document.getElementById("lbItemFilterWrap");
    if (!catContainer || !itemContainer) return;

    // 1. Secondary Categories Bar
    if (sec.isCollection) {
      catContainer.style.display = "flex";
      catContainer.innerHTML = sec.subCats.map((sub) => {
        const subObj = CONFIG.collections[sub] || { name: sub, items: [] };
        const isActive = state.subCatKey === sub;
        return `
          <button type="button" class="lb-cat-tab ${isActive ? "active" : ""}" data-subcat="${sub}">
            <span>${subObj.name}</span>
            <span class="lb-item-count-badge">${subObj.items?.length || 0}</span>
          </button>
        `;
      }).join("");

      catContainer.querySelectorAll(".lb-cat-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.subCatKey = btn.getAttribute("data-subcat");
          const items = CONFIG.collections[state.subCatKey]?.items || [];
          state.itemSlug = items[0]?.slug || "";
          setRouteHash(state.categoryKey, state.subCatKey, state.itemSlug);
          loadCurrentLeaderboard();
        });
      });
    } else if (sec.categories.length > 1) {
      catContainer.style.display = "flex";
      catContainer.innerHTML = sec.categories.map((cKey) => {
        const cObj = CONFIG.categories[cKey] || { name: cKey, items: [] };
        const isActive = state.categoryKey === cKey;
        const itemCount = cObj.items?.length || 1;
        return `
          <button type="button" class="lb-cat-tab ${isActive ? "active" : ""}" data-cat="${cKey}">
            <span>${cObj.name}</span>
            ${itemCount > 1 ? `<span class="lb-item-count-badge">${itemCount}</span>` : ""}
          </button>
        `;
      }).join("");

      catContainer.querySelectorAll(".lb-cat-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.categoryKey = btn.getAttribute("data-cat");
          state.subCatKey = null;
          const items = CONFIG.categories[state.categoryKey]?.items || [];
          state.itemSlug = items[0]?.slug || state.categoryKey;
          setRouteHash(state.categoryKey, state.subCatKey, state.itemSlug);
          loadCurrentLeaderboard();
        });
      });
    } else {
      catContainer.style.display = "none";
    }

    // 2. Sub-items Bar
    let currentItems = [];
    if (sec.isCollection && state.subCatKey) {
      currentItems = CONFIG.collections[state.subCatKey]?.items || [];
    } else {
      currentItems = CONFIG.categories[state.categoryKey]?.items || [];
    }

    // If only 1 item and item name is identical to category, hide item selector
    if (currentItems.length <= 1) {
      itemContainer.style.display = "none";
      if (itemFilterWrap) itemFilterWrap.style.display = "none";
      return;
    }

    itemContainer.style.display = "flex";
    if (itemFilterWrap) {
      itemFilterWrap.style.display = currentItems.length > 8 ? "block" : "none";
    }

    renderItemPills(currentItems);
  }

  // Render sub-items pills with filter support
  function renderItemPills(items, filterText = "") {
    const itemContainer = document.getElementById("lbItemPills");
    if (!itemContainer) return;

    const filtered = items.filter((item) => {
      if (!filterText) return true;
      const clean = cleanItemName(item.name).toLowerCase();
      const slug = (item.slug || "").toLowerCase();
      return clean.includes(filterText.toLowerCase()) || slug.includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
      itemContainer.innerHTML = `<div class="lb-no-items-hint">No matching items found</div>`;
      return;
    }

    itemContainer.innerHTML = filtered.map((item) => {
      const isActive = item.slug.toLowerCase() === state.itemSlug.toLowerCase();
      const displayName = cleanItemName(item.name);
      return `
        <button type="button" class="lb-item-chip ${isActive ? "active" : ""}" data-slug="${item.slug}">
          <span>${displayName}</span>
        </button>
      `;
    }).join("");

    itemContainer.querySelectorAll(".lb-item-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.itemSlug = btn.getAttribute("data-slug");
        setRouteHash(state.categoryKey, state.subCatKey, state.itemSlug);
        loadCurrentLeaderboard();
      });
    });
  }

  // RENDER: Top 3 Podium
  function renderPodium(players, isRace, scoreLabel) {
    const podiumGrid = document.getElementById("lbPodiumGrid");
    if (!podiumGrid) return;

    if (!players || players.length === 0) {
      podiumGrid.style.display = "none";
      return;
    }

    podiumGrid.style.display = "grid";

    // Top 3 entries
    const p1 = players[0] || null;
    const p2 = players[1] || null;
    const p3 = players[2] || null;

    function buildCard(player, rankClass, rankLabel, medalIcon) {
      if (!player) {
        return `
          <div class="lb-podium-card ${rankClass} empty-podium">
            <div class="lb-podium-rank-tag">${medalIcon} ${rankLabel}</div>
            <div class="lb-podium-avatar-placeholder"></div>
            <div class="lb-podium-name">Empty</div>
            <div class="lb-podium-score">--</div>
          </div>
        `;
      }

      const pName = player.name || "Unknown";
      const profile = player.profile ? String(player.profile).trim().toUpperCase() : null;
      const profileStyle = profile && PROFILE_COLORS[profile]
        ? `background: ${PROFILE_COLORS[profile].bg}; color: ${PROFILE_COLORS[profile].text}; border-color: ${PROFILE_COLORS[profile].border};`
        : "";

      const formattedScore = formatScore(player.score ?? player.value, isRace);
      const avatarUrl = `https://mc-api.io/render/BUST/${encodeURIComponent(pName)}/BEDROCK?size=160`;

      return `
        <div class="lb-podium-card ${rankClass}">
          <div class="lb-podium-rank-tag">${medalIcon} ${rankLabel}</div>
          <img class="lb-podium-avatar" src="${avatarUrl}" alt="${pName}" onerror="this.src='https://mc-api.io/render/BUST/steve/BEDROCK?size=160'; this.onerror=null;" />
          <a class="lb-podium-name" href="/player.html?player=${encodeURIComponent(pName)}" title="View ${pName}'s SkyBlock Profile">
            ${pName}
          </a>
          ${profile ? `<span class="lb-profile-badge" style="${profileStyle}">[${profile}]</span>` : ""}
          <div class="lb-podium-score">
            ${formattedScore}
            <span>${scoreLabel || ""}</span>
          </div>
        </div>
      `;
    }

    podiumGrid.innerHTML = `
      ${buildCard(p2, "rank-2-card", "#2 SILVER", "🥈")}
      ${buildCard(p1, "rank-1-card", "#1 GOLD", "👑")}
      ${buildCard(p3, "rank-3-card", "#3 BRONZE", "🥉")}
    `;
  }

  // RENDER: Main Rankings Table
  function renderTable(players, isRace, scoreLabel) {
    const tableBody = document.getElementById("lbTableBody");
    const countLabel = document.getElementById("lbTableCountLabel");
    const paginationWrap = document.getElementById("lbPaginationWrap");
    if (!tableBody) return;

    if (!players || players.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="lb-empty-state">
            <span class="material-icons">info</span>
            <p>No players found matching your criteria.</p>
          </td>
        </tr>
      `;
      if (countLabel) countLabel.textContent = "0 players";
      if (paginationWrap) paginationWrap.innerHTML = "";
      return;
    }

    // Pagination calculations
    const total = players.length;
    const pageSize = state.pageSize === "all" ? total : parseInt(state.pageSize, 10);
    const totalPages = Math.ceil(total / pageSize);
    state.currentPage = Math.max(1, Math.min(state.currentPage, totalPages));

    const startIndex = (state.currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const visiblePlayers = players.slice(startIndex, endIndex);

    if (countLabel) {
      countLabel.textContent = `Showing ${startIndex + 1}–${endIndex} of ${total.toLocaleString()} players`;
    }

    tableBody.innerHTML = visiblePlayers.map((player) => {
      const rank = player.rank || (players.indexOf(player) + 1);
      let rankBadgeClass = "rank-other";
      if (rank === 1) rankBadgeClass = "rank-1";
      else if (rank === 2) rankBadgeClass = "rank-2";
      else if (rank === 3) rankBadgeClass = "rank-3";

      const pName = player.name || "Unknown";
      const profile = player.profile ? String(player.profile).trim().toUpperCase() : null;
      const profileStyle = profile && PROFILE_COLORS[profile]
        ? `background: ${PROFILE_COLORS[profile].bg}; color: ${PROFILE_COLORS[profile].text}; border-color: ${PROFILE_COLORS[profile].border};`
        : "";

      const formattedScore = formatScore(player.score ?? player.value, isRace);
      const avatarUrl = `https://mc-api.io/render/HEAD/${encodeURIComponent(pName)}/BEDROCK?size=32`;

      return `
        <tr>
          <td style="width: 70px;">
            <span class="rank-badge ${rankBadgeClass}">#${rank}</span>
          </td>
          <td>
            <div class="player-cell">
              <img class="player-avatar" src="${avatarUrl}" alt="${pName}" onerror="this.src='https://mc-api.io/render/HEAD/steve/BEDROCK?size=32'; this.onerror=null;" />
              <a class="player-name-link" href="/player.html?player=${encodeURIComponent(pName)}" title="View ${pName}'s SkyBlock Profile">
                ${pName}
              </a>
              ${profile ? `<span class="lb-profile-badge" style="${profileStyle}">[${profile}]</span>` : ""}
              ${player.private ? `<span class="lb-private-badge" title="API Disabled / Private Profile"><span class="material-icons" style="font-size:12px;">lock</span> Private</span>` : ""}
            </div>
          </td>
          <td class="score-cell text-right">
            ${formattedScore}
          </td>
        </tr>
      `;
    }).join("");

    renderPaginationControls(totalPages);
  }

  // RENDER: Pagination Controls
  function renderPaginationControls(totalPages) {
    const wrap = document.getElementById("lbPaginationWrap");
    if (!wrap) return;

    if (totalPages <= 1 || state.pageSize === "all") {
      wrap.innerHTML = "";
      return;
    }

    let pages = [];
    const curr = state.currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (curr > 3) pages.push("...");
      const start = Math.max(2, curr - 1);
      const end = Math.min(totalPages - 1, curr + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (curr < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    wrap.innerHTML = `
      <div class="lb-pagination">
        <button type="button" class="lb-page-btn" ${curr === 1 ? "disabled" : ""} data-page="${curr - 1}">
          <span class="material-icons">chevron_left</span> Prev
        </button>
        ${pages.map((p) => {
          if (p === "...") return `<span class="lb-page-ellipsis">&hellip;</span>`;
          return `<button type="button" class="lb-page-btn ${p === curr ? "active" : ""}" data-page="${p}">${p}</button>`;
        }).join("")}
        <button type="button" class="lb-page-btn" ${curr === totalPages ? "disabled" : ""} data-page="${curr + 1}">
          Next <span class="material-icons">chevron_right</span>
        </button>
      </div>
    `;

    wrap.querySelectorAll(".lb-page-btn[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = parseInt(btn.getAttribute("data-page"), 10);
        if (page && page !== state.currentPage) {
          state.currentPage = page;
          const isRace = state.categoryKey === "races" || (state.itemSlug || "").includes("race");
          renderTable(state.filteredPlayers, isRace, state.scoreLabel);
          // Smooth scroll to table top
          const tableElem = document.getElementById("lbTableCard");
          if (tableElem) {
            tableElem.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });
  }

  // Filter players list
  function applyPlayerFilter() {
    const q = state.searchFilter.trim().toLowerCase();
    if (!q) {
      state.filteredPlayers = state.allPlayers;
    } else {
      state.filteredPlayers = state.allPlayers.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const profile = (p.profile || "").toLowerCase();
        return name.includes(q) || profile.includes(q);
      });
    }
    state.currentPage = 1;
    const isRace = state.categoryKey === "races" || (state.itemSlug || "").includes("race");
    renderTable(state.filteredPlayers, isRace, state.scoreLabel);
  }

  // Load Current Leaderboard
  async function loadCurrentLeaderboard() {
    state.loading = true;
    state.error = null;
    showLoadingState(true);

    renderSectionTabs();
    renderSubNavigation();

    // Update Header Text
    const resolved = resolveTargetItem(state.categoryKey, state.subCatKey, state.itemSlug);
    const item = resolved.item;
    state.itemName = cleanItemName(item.name || state.itemSlug);
    state.scoreLabel = item.scoreLabel || "Score";

    const titleElem = document.getElementById("lbCurrentTitle");
    const metaElem = document.getElementById("lbCurrentMeta");
    const scoreHeaderElem = document.getElementById("lbTableScoreHeader");

    const sec = SECTIONS.find((s) => s.id === state.sectionId) || SECTIONS[0];
    let breadcrumbTitle = `${sec.num ? `${sec.num}. ` : ""}${sec.name}`;

    if (sec.isCollection && state.subCatKey) {
      const collName = CONFIG.collections[state.subCatKey]?.name || state.subCatKey;
      breadcrumbTitle += ` › ${collName} › ${state.itemName}`;
    } else if (sec.categories && sec.categories.length > 1) {
      const catObj = CONFIG.categories[state.categoryKey];
      const catDisplayName = catObj?.name || state.categoryKey;
      if (catDisplayName.toLowerCase() !== sec.name.toLowerCase()) {
        breadcrumbTitle += ` › ${catDisplayName}`;
      }
      if (state.itemName && state.itemName.toLowerCase() !== catDisplayName.toLowerCase()) {
        breadcrumbTitle += ` › ${state.itemName}`;
      }
    } else {
      if (state.itemName && state.itemName.toLowerCase() !== sec.name.toLowerCase()) {
        breadcrumbTitle += ` › ${state.itemName}`;
      }
    }

    if (titleElem) {
      titleElem.textContent = breadcrumbTitle;
    }
    document.title = `${state.itemName} - Leaderboards | CraftersMC Guides`;
    if (scoreHeaderElem) {
      scoreHeaderElem.textContent = state.scoreLabel.toUpperCase();
    }

    try {
      const data = await fetchLeaderboard(state.categoryKey, state.subCatKey, state.itemSlug);
      const isRace = state.categoryKey === "races" || (state.itemSlug || "").includes("race");

      const rawPlayers = data?.data?.players || data?.players || [];
      state.allPlayers = Array.isArray(rawPlayers) ? rawPlayers : [];
      state.filteredPlayers = state.allPlayers;
      state.totalCount = data?.totalCount || state.allPlayers.length;

      // Last updated text
      state.lastUpdatedText = data?.lastUpdated || (data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "");
      if (metaElem) {
        metaElem.textContent = `${state.totalCount.toLocaleString()} Total Players Ranked • ${state.lastUpdatedText ? "Updated " + state.lastUpdatedText : "Live Data"}`;
      }

      applyPlayerFilter();
      renderPodium(state.allPlayers, isRace, state.scoreLabel);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      state.error = err.message;
      showErrorState(err.message);
    } finally {
      state.loading = false;
      showLoadingState(false);
    }
  }

  // UI state toggles
  function showLoadingState(isLoading) {
    const spinner = document.getElementById("lbLoadingOverlay");
    if (spinner) spinner.style.display = isLoading ? "flex" : "none";
  }

  function showErrorState(msg) {
    const tableBody = document.getElementById("lbTableBody");
    const podiumGrid = document.getElementById("lbPodiumGrid");
    if (podiumGrid) podiumGrid.style.display = "none";
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="lb-error-state">
            <span class="material-icons">error_outline</span>
            <h4>Unable to Load Leaderboard Data</h4>
            <p>${msg || "Please check your network connection or try again later."}</p>
            <button type="button" class="lb-retry-btn" onclick="window.CraftersLeaderboards.reload()">
              <span class="material-icons">refresh</span> Retry
            </button>
          </td>
        </tr>
      `;
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Hash change routing
    window.addEventListener("hashchange", () => {
      const route = parseRouteFromHash();
      state.categoryKey = route.catKey;
      state.subCatKey = route.subCat;
      state.itemSlug = route.itemSlug;
      state.sectionId = findSectionForCategory(state.categoryKey);
      loadCurrentLeaderboard();
    });

    // In-table search input
    const searchInput = document.getElementById("lbPlayerSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchFilter = e.target.value;
        applyPlayerFilter();
      });
    }

    // Sub-item filter input
    const itemFilterInput = document.getElementById("lbItemFilterInput");
    if (itemFilterInput) {
      itemFilterInput.addEventListener("input", (e) => {
        const text = e.target.value;
        let items = [];
        if (state.categoryKey === "collections" && state.subCatKey) {
          items = CONFIG.collections[state.subCatKey]?.items || [];
        } else {
          items = CONFIG.categories[state.categoryKey]?.items || [];
        }
        renderItemPills(items, text);
      });
    }

    // Page size selector
    const pageSizeSelect = document.getElementById("lbPageSizeSelect");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        state.pageSize = e.target.value;
        state.currentPage = 1;
        const isRace = state.categoryKey === "races" || (state.itemSlug || "").includes("race");
        renderTable(state.filteredPlayers, isRace, state.scoreLabel);
      });
    }

    // Global Search Modal / Autocomplete
    setupGlobalSearch();

    // Copy link button
    const shareBtn = document.getElementById("lbShareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast("Leaderboard link copied to clipboard!");
        }).catch(() => {
          showToast("Link: " + window.location.href);
        });
      });
    }

    // Refresh data button
    const refreshBtn = document.getElementById("lbRefreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        const cacheKey = state.categoryKey === "collections" ? `collections:${state.subCatKey}:${state.itemSlug}` : `${state.categoryKey}:${state.itemSlug}`;
        datasetCache.delete(cacheKey);
        loadCurrentLeaderboard();
        showToast("Refreshing leaderboard data...");
      });
    }
  }

  // Global Quick Finder / Search across all 227 leaderboards
  function setupGlobalSearch() {
    const globalInput = document.getElementById("lbGlobalSearchInput");
    const resultsContainer = document.getElementById("lbGlobalSearchResults");
    if (!globalInput || !resultsContainer) return;

    // Build flattened catalog of all leaderboards
    const catalog = [];

    // 1. Collections
    for (const [subKey, subObj] of Object.entries(CONFIG.collections || {})) {
      for (const item of subObj.items || []) {
        catalog.push({
          title: cleanItemName(item.name),
          category: `3. Collections › ${subObj.name}`,
          catKey: "collections",
          subCat: subKey,
          slug: item.slug
        });
      }
    }

    // 2. Standard Categories
    for (const [catKey, catObj] of Object.entries(CONFIG.categories || {})) {
      const secId = findSectionForCategory(catKey);
      const sec = SECTIONS.find((s) => s.id === secId);
      const prefix = sec ? `${sec.num ? `${sec.num}. ` : ""}${sec.name}` : catObj.name;
      const categoryLabel = (sec && catObj.name.toLowerCase() !== sec.name.toLowerCase())
        ? `${prefix} › ${catObj.name}`
        : prefix;

      for (const item of catObj.items || []) {
        catalog.push({
          title: cleanItemName(item.name),
          category: categoryLabel,
          catKey,
          subCat: null,
          slug: item.slug
        });
      }
    }

    globalInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        resultsContainer.style.display = "none";
        resultsContainer.innerHTML = "";
        return;
      }

      const matches = catalog.filter((entry) => {
        return entry.title.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q) || entry.slug.toLowerCase().includes(q);
      }).slice(0, 10);

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div class="lb-search-no-match">No leaderboards found matching "${q}"</div>`;
        resultsContainer.style.display = "block";
        return;
      }

      resultsContainer.innerHTML = matches.map((m) => `
        <div class="lb-search-result-item" data-cat="${m.catKey}" data-subcat="${m.subCat || ""}" data-slug="${m.slug}">
          <div class="lb-search-result-title">${m.title}</div>
          <div class="lb-search-result-cat">${m.category}</div>
        </div>
      `).join("");

      resultsContainer.style.display = "block";

      resultsContainer.querySelectorAll(".lb-search-result-item").forEach((el) => {
        el.addEventListener("click", () => {
          const c = el.getAttribute("data-cat");
          const s = el.getAttribute("data-subcat") || null;
          const slug = el.getAttribute("data-slug");

          state.categoryKey = c;
          state.subCatKey = s;
          state.itemSlug = slug;
          state.sectionId = findSectionForCategory(c);

          globalInput.value = "";
          resultsContainer.style.display = "none";

          setRouteHash(c, s, slug);
          loadCurrentLeaderboard();
        });
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!globalInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = "none";
      }
    });
  }

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById("lbToastNotification");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "lbToastNotification";
      toast.className = "lb-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  }

  // Initialize
  function init() {
    const route = parseRouteFromHash();
    state.categoryKey = route.catKey;
    state.subCatKey = route.subCat;
    state.itemSlug = route.itemSlug;
    state.sectionId = findSectionForCategory(state.categoryKey);

    setupEventListeners();
    loadCurrentLeaderboard();
  }

  // Export to window for debugging or manual reload
  window.CraftersLeaderboards = {
    reload: loadCurrentLeaderboard,
    getState: () => ({ ...state })
  };

  // Run on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

