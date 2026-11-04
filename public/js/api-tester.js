/**
 * CraftersMC Guides — Feather Bot REST API Studio Controller
 * Full interactive testbed for all endpoints with live HTTP dispatching,
 * GET/POST support, latency benchmarking, and visual cards.
 * Matches Feather Bot REST API on http://localhost:4994/
 */

(function () {
  'use strict';

  // --- STATE ---
  let activeEndpointKey = 'networth';
  let activeHttpMode = 'GET'; // 'GET' or 'POST'
  let activeViewTab = 'visual'; // 'visual', 'json', or 'docs'
  let lastResponseData = null;
  let lastResponseStatus = null;
  let lastResponseTime = 0;
  let lastResponseSize = 0;

  // Local Storage Keys & Config
  const STORAGE_BASE_URL = 'feather_api_base_url';
  const STORAGE_USE_PROXY = 'feather_api_use_proxy';
  const STORAGE_API_KEY = 'feather_api_custom_key';
  const DEFAULT_BASE_URL = 'http://135.125.9.81:4994';

  function getBaseUrl() {
    const saved = localStorage.getItem(STORAGE_BASE_URL);
    if (!saved || saved === 'http://localhost:3000' || saved === 'http://localhost:4994') {
      return DEFAULT_BASE_URL;
    }
    let clean = saved.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'http://' + clean;
    }
    return clean;
  }

  function setBaseUrl(url) {
    let clean = (url || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'http://' + clean;
    }
    localStorage.setItem(STORAGE_BASE_URL, clean);
    return clean;
  }

  function getApiKeyOverride() {
    const el = document.getElementById('serverApiKey');
    if (el && el.value && el.value.trim()) {
      return el.value.trim();
    }
    return (localStorage.getItem(STORAGE_API_KEY) || '').trim();
  }

  function shouldUseProxy() {
    const checkbox = document.getElementById('useProxyCheckbox');
    if (checkbox) {
      return checkbox.checked;
    }
    return window.location.protocol === 'https:';
  }

  function resolveRequestTarget(rawTargetUrl) {
    const useProxy = shouldUseProxy();
    const isHttpsPage = window.location.protocol === 'https:';
    const isInsecureTarget = rawTargetUrl.startsWith('http://');
    const customKey = getApiKeyOverride();

    const headers = {};
    if (customKey) {
      headers['x-api-key'] = customKey;
    }

    // Route via Cloudflare Edge Proxy if proxy is checked or if on HTTPS calling insecure HTTP
    if (useProxy || (isHttpsPage && isInsecureTarget)) {
      const proxyUrl = `/api/tester-proxy?target=${encodeURIComponent(rawTargetUrl)}`;
      return {
        url: proxyUrl,
        proxied: true,
        headers: {
          'X-Guides-Client': 'craftersmc-web',
          ...headers
        }
      };
    }

    return {
      url: rawTargetUrl,
      proxied: false,
      headers
    };
  }

  // --- TOAST NOTIFICATIONS ---
  const toast = document.getElementById('apiToast');
  const toastText = document.getElementById('apiToastText');

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  // --- ENDPOINTS REGISTRY ---
  const ENDPOINTS = {
    networth: {
      name: "Player Networth",
      path: "/api/networth",
      icon: "account_balance_wallet",
      description: "Calculates player networth, purse, bank coins, and complete inventory valuation.",
      defaultParams: {
        player: "NetworkPg",
        profile: "PLUM"
      },
      presets: [
        { label: "NetworkPg (PLUM)", params: { player: "NetworkPg", profile: "PLUM" } },
        { label: "T30ki (POMEGRANTE)", params: { player: "T30ki", profile: "POMEGRANTE" } },
        { label: "craftersmc (Active)", params: { player: "craftersmc", profile: "" } }
      ]
    },

    item_price: {
      name: "Unified Item Price",
      path: "/api/item/price",
      icon: "sell",
      description: "Unified item pricing across Auction House, Bazaar, Pets, Minions, Recipes, and Kill-scaling.",
      defaultParams: {
        item: "Super Compactor 3000",
        type: "all",
        amount: 1,
        kills: "",
        rarity: "",
        level: "",
        candy: "",
        from_tier: 0,
        to_tier: 11
      },
      presets: [
        { label: "Super Compactor 3000", params: { item: "Super Compactor 3000", type: "all", amount: 1 } },
        { label: "Diamond Minion (0->11)", params: { item: "Diamond Minion", type: "minions", from_tier: 1, to_tier: 11 } },
        { label: "Aspect of the Dragons", params: { item: "Aspect of the Dragons", type: "all", amount: 1 } },
        { label: "Revenant Boots (10k kills)", params: { item: "Revenant Boots", kills: 10000, amount: 1 } },
        { label: "Blood God Crest (50k kills)", params: { item: "Blood God Crest", kills: 50000, amount: 2 } },
        { label: "Duck Pet (Legendary Lv 100)", params: { item: "Duck Pet", type: "pets", rarity: "legendary", level: 100, candy: 10 } }
      ]
    },

    xp_calc: {
      name: "XP & Skill Calc",
      path: "/api/xp/calc",
      icon: "psychology",
      description: "Skill leveling calculator & experience bottle requirement calculator.",
      defaultParams: {
        skill: "Enchanting",
        current_level: 20,
        target_level: 50
      },
      presets: [
        { label: "Enchanting: Lv 20 -> 50", params: { skill: "Enchanting", current_level: 20, target_level: 50 } },
        { label: "Combat: Lv 1 -> 60", params: { skill: "Combat", current_level: 1, target_level: 60 } },
        { label: "Farming: Lv 30 -> 60", params: { skill: "Farming", current_level: 30, target_level: 60 } }
      ]
    },

    minion_prod: {
      name: "Minion Production",
      path: "/api/minion/prod",
      icon: "precision_manufacturing",
      description: "Drop yields, NPC sell value, and live Bazaar revenue across CraftersMC minions, fuels, and modifiers.",
      defaultParams: {
        minion: "Slime Minion",
        tier: 11,
        count: 1,
        fuel: "Enchanted Lava Bucket",
        hours: 24,
        superCompactor: true,
        diamondSpreading: true,
        potatoSpreading: false
      },
      presets: [
        { label: "Slime Minion (T11, 24h, E-Lava + DiaSpread)", params: { minion: "Slime Minion", tier: 11, count: 1, fuel: "Enchanted Lava Bucket", hours: 24, superCompactor: true, diamondSpreading: true, potatoSpreading: false } },
        { label: "Slime 24x Setup (T11, 24h, Foul Flesh)", params: { minion: "Slime Minion", tier: 11, count: 24, fuel: "Foul Flesh", hours: 24, superCompactor: true, diamondSpreading: true, potatoSpreading: false } },
        { label: "Diamond Minion (T11, 24h, SC3000)", params: { minion: "Diamond Minion", tier: 11, count: 1, fuel: "Enchanted Lava Bucket", hours: 24, superCompactor: true, diamondSpreading: false, potatoSpreading: false } },
        { label: "Duck Minion (T11, 7 Days, DiaSpread)", params: { minion: "Duck Minion", tier: 11, count: 1, fuel: "Enchanted Lava Bucket", hours: 168, superCompactor: true, diamondSpreading: true, potatoSpreading: false } },
        { label: "Potato Minion (T11, PotatoSpread)", params: { minion: "Potato Minion", tier: 11, count: 1, fuel: "Enchanted Lava Bucket", hours: 24, superCompactor: true, diamondSpreading: false, potatoSpreading: true } },
        { label: "Wheat Minion (T11, 24h, Raw Drops)", params: { minion: "Wheat Minion", tier: 11, count: 1, fuel: "None", hours: 24, superCompactor: false, diamondSpreading: false, potatoSpreading: false } }
      ]
    },

    pet_xp: {
      name: "Pet XP & Leveling",
      path: "/api/pet/xp",
      icon: "pets",
      description: "Calculates pet XP curves and Ultimate Beetroot Candies required up to target level.",
      defaultParams: {
        pet: "Duck Pet",
        rarity: "legendary",
        current_level: 1,
        target_level: 100
      },
      presets: [
        { label: "Duck Pet: Lv 1 -> 100", params: { pet: "Duck Pet", rarity: "legendary", current_level: 1, target_level: 100 } },
        { label: "Bee Pet: Lv 1 -> 100", params: { pet: "Bee Pet", rarity: "legendary", current_level: 1, target_level: 100 } },
        { label: "Rock Pet: Lv 1 -> 100 (Epic)", params: { pet: "Rock Pet", rarity: "epic", current_level: 1, target_level: 100 } },
        { label: "Phoenix Pet: Lv 1 -> 100", params: { pet: "Phoenix Pet", rarity: "legendary", current_level: 1, target_level: 100 } }
      ]
    },

    recipe: {
      name: "Item Recipe & Stacks",
      path: "/api/recipe",
      icon: "handyman",
      description: "Item crafting recipe, direct ingredient stacks, uncrafted raw base materials, and profit margins.",
      defaultParams: {
        item: "Super Compactor 3000",
        amount: 2
      },
      presets: [
        { label: "Super Compactor 3000 (x2)", params: { item: "Super Compactor 3000", amount: 2 } },
        { label: "Diamond Spreading (x1)", params: { item: "Diamond Spreading", amount: 1 } },
        { label: "Aspect of the End", params: { item: "Aspect of the End", amount: 1 } },
        { label: "Personal Compactor 4000", params: { item: "Personal Compactor 4000", amount: 1 } }
      ]
    }
  };

  // --- DOM ELEMENTS ---
  const serverBaseUrlInput = document.getElementById('serverBaseUrl');
  const pingServerBtn = document.getElementById('pingServerBtn');
  const serverStatusBadge = document.getElementById('serverStatusBadge');
  const tabsContainer = document.getElementById('endpointTabs');
  const formContainer = document.getElementById('endpointFormContainer');
  const requestUrlPreview = document.getElementById('requestUrlPreview');
  const requestMethodTag = document.getElementById('requestMethodTag');
  const sendRequestBtn = document.getElementById('sendRequestBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const copyCurlBtn = document.getElementById('copyCurlBtn');
  const openUrlBtn = document.getElementById('openUrlBtn');

  // Response Elements
  const resStatusBadge = document.getElementById('resStatusBadge');
  const resTimeBadge = document.getElementById('resTimeBadge');
  const resSizeBadge = document.getElementById('resSizeBadge');
  const viewTabVisual = document.getElementById('viewTabVisual');
  const viewTabJson = document.getElementById('viewTabJson');
  const viewTabDocs = document.getElementById('viewTabDocs');
  const responseVisualWrap = document.getElementById('responseVisualWrap');
  const responseJsonWrap = document.getElementById('responseJsonWrap');
  const responseDocsWrap = document.getElementById('responseDocsWrap');
  const rawJsonOutput = document.getElementById('rawJsonOutput');
  const copyJsonBtn = document.getElementById('copyJsonBtn');

  // --- INITIALIZATION ---
  function init() {
    // 1. Load Base URL from Storage (defaults to http://135.125.9.81:4994)
    if (serverBaseUrlInput) {
      serverBaseUrlInput.value = getBaseUrl();
      const onUrlChange = () => {
        setBaseUrl(serverBaseUrlInput.value);
        updateLiveUrlPreview();
        testServerConnection();
      };
      serverBaseUrlInput.addEventListener('change', onUrlChange);
      serverBaseUrlInput.addEventListener('input', () => {
        updateLiveUrlPreview();
      });
    }

    // 1b. Load and bind HTTPS Proxy Checkbox
    const useProxyCheckbox = document.getElementById('useProxyCheckbox');
    if (useProxyCheckbox) {
      const savedProxy = localStorage.getItem(STORAGE_USE_PROXY);
      if (savedProxy !== null) {
        useProxyCheckbox.checked = savedProxy === 'true';
      } else {
        useProxyCheckbox.checked = window.location.protocol === 'https:';
      }
      useProxyCheckbox.addEventListener('change', () => {
        localStorage.setItem(STORAGE_USE_PROXY, useProxyCheckbox.checked ? 'true' : 'false');
        testServerConnection();
      });
    }

    // 1c. Load and bind custom API key input
    const serverApiKeyInput = document.getElementById('serverApiKey');
    if (serverApiKeyInput) {
      serverApiKeyInput.value = localStorage.getItem(STORAGE_API_KEY) || '';
      serverApiKeyInput.addEventListener('change', () => {
        const val = serverApiKeyInput.value.trim();
        if (val) {
          localStorage.setItem(STORAGE_API_KEY, val);
        } else {
          localStorage.removeItem(STORAGE_API_KEY);
        }
        updateLiveUrlPreview();
      });
      serverApiKeyInput.addEventListener('input', () => {
        updateLiveUrlPreview();
      });
    }

    // 2. Render Endpoint Tabs
    renderEndpointTabs();

    // 4. Render Active Form
    renderEndpointForm(activeEndpointKey);

    // 5. Setup Action Buttons
    if (pingServerBtn) {
      pingServerBtn.addEventListener('click', testServerConnection);
    }

    if (sendRequestBtn) {
      sendRequestBtn.addEventListener('click', executeApiRequest);
    }

    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        const url = getFullRequestUrl();
        copyToClipboard(url, 'Copied Request URL!');
      });
    }

    if (copyCurlBtn) {
      copyCurlBtn.addEventListener('click', () => {
        const curl = generateCurlCommand();
        copyToClipboard(curl, 'Copied cURL command!');
      });
    }

    if (openUrlBtn) {
      openUrlBtn.addEventListener('click', () => {
        const url = getFullRequestUrl();
        window.open(url, '_blank');
      });
    }

    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', () => {
        if (!lastResponseData) {
          showToast('No response data to copy');
          return;
        }
        copyToClipboard(JSON.stringify(lastResponseData, null, 2), 'Copied JSON payload!');
      });
    }

    // View tabs
    if (viewTabVisual) viewTabVisual.addEventListener('click', () => switchViewTab('visual'));
    if (viewTabJson) viewTabJson.addEventListener('click', () => switchViewTab('json'));
    if (viewTabDocs) viewTabDocs.addEventListener('click', () => switchViewTab('docs'));

    // Keyboard shortcut (Ctrl + Enter)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeApiRequest();
      }
    });

    // Check server on page load
    testServerConnection();
  }

  // --- RENDER TABS ---
  function renderEndpointTabs() {
    if (!tabsContainer) return;
    tabsContainer.innerHTML = Object.keys(ENDPOINTS).map(key => {
      const ep = ENDPOINTS[key];
      const isActive = key === activeEndpointKey;
      return `
        <button type="button" class="api-tab-btn ${isActive ? 'active' : ''}" data-key="${key}">
          <span class="material-icons" style="font-size:18px;">${ep.icon}</span>
          <span class="api-tab-method">GET</span>
          <span>${ep.name}</span>
        </button>
      `;
    }).join('');

    tabsContainer.querySelectorAll('.api-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key && key !== activeEndpointKey) {
          activeEndpointKey = key;
          tabsContainer.querySelectorAll('.api-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderEndpointForm(key);
        }
      });
    });
  }

  // --- RENDER FORM FOR CURRENT ENDPOINT ---
  function renderEndpointForm(key) {
    if (!formContainer) return;
    const ep = ENDPOINTS[key];
    if (!ep) return;

    let formHtml = '';

    // Presets Header
    const presetsHtml = (ep.presets || []).map((p, idx) => {
      return `<button type="button" class="api-preset-chip" data-preset-idx="${idx}">${escapeHtml(p.label)}</button>`;
    }).join('');

    // Method and Path header
    const headerHtml = `
      <div class="api-panel-header">
        <div class="api-panel-title-group">
          <span class="material-icons api-panel-icon">${ep.icon}</span>
          <div>
            <h2 class="api-panel-title">${ep.name}</h2>
            <span class="api-panel-path">${ep.path}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <label style="font-size:0.8rem; font-weight:800; color:var(--api-text-muted);">METHOD:</label>
          <select class="api-select" id="field_httpMethod" style="height:34px; padding:0 0.5rem; font-size:0.8rem; width:85px;">
            <option value="GET" ${activeHttpMode === 'GET' ? 'selected' : ''}>GET</option>
            <option value="POST" ${activeHttpMode === 'POST' ? 'selected' : ''}>POST</option>
          </select>
        </div>
      </div>
    `;

    // Specific Form Fields
    if (key === 'networth') {
      formHtml = `
        <div class="api-field-group">
          <label class="api-field-label">
            <span>Minecraft Player <span class="api-field-required">*</span></span>
            <span class="api-field-hint">Username or Player UUID</span>
          </label>
          <input type="text" class="api-input" id="field_player" value="${ep.defaultParams.player}" placeholder="e.g. NetworkPg or T30ki" required />
        </div>

        <div class="api-field-group">
          <label class="api-field-label">
            <span>Profile CuteName or ID</span>
            <span class="api-field-hint">e.g. PLUM, POMEGRANTE, Apple, Mango</span>
          </label>
          <input type="text" class="api-input" id="field_profile" value="${ep.defaultParams.profile}" placeholder="e.g. PLUM" />
        </div>
      `;
    } else if (key === 'item_price') {
      formHtml = `
        <div class="api-form-row">
          <div class="api-field-group">
            <label class="api-field-label">
              <span>Item / Pet / Minion Name <span class="api-field-required">*</span></span>
            </label>
            <input type="text" class="api-input" id="field_item" value="${ep.defaultParams.item}" placeholder="e.g. Super Compactor 3000, Diamond Minion" required />
          </div>
          <div class="api-field-group">
            <label class="api-field-label">
              <span>Market Filter Type</span>
            </label>
            <select class="api-select" id="field_type">
              <option value="all">All Markets (Auto-Resolves Best Price)</option>
              <option value="auction">Auction House (7d avg &amp; BIN)</option>
              <option value="bazaar">Bazaar (Buy orders &amp; Sell offers)</option>
              <option value="pets">Pets (Level curve &amp; candy)</option>
              <option value="minions">Minions (Tier upgrade costs)</option>
              <option value="recipe">Recipe (Crafting costs &amp; margins)</option>
            </select>
          </div>
        </div>

        <div class="api-form-row-3">
          <div class="api-field-group">
            <label class="api-field-label"><span>Amount (Quantity)</span></label>
            <input type="number" class="api-input" id="field_amount" value="${ep.defaultParams.amount}" min="1" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Kill Scaling (Armor/Crest)</span></label>
            <input type="number" class="api-input" id="field_kills" placeholder="e.g. 10000" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Pet Rarity</span></label>
            <select class="api-select" id="field_rarity">
              <option value="">None / Auto</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
          </div>
        </div>

        <div class="api-form-row-3">
          <div class="api-field-group">
            <label class="api-field-label"><span>Pet Level</span></label>
            <input type="number" class="api-input" id="field_level" placeholder="1–100" min="1" max="100" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Pet Candies</span></label>
            <input type="number" class="api-input" id="field_candy" placeholder="0–10" min="0" max="10" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Minion Tiers</span></label>
            <div style="display:flex; gap:0.4rem; align-items:center;">
              <input type="number" class="api-input" id="field_from_tier" value="0" min="0" max="11" placeholder="From 0" title="Starting Tier" />
              <span style="font-weight:800; color:var(--api-text-muted);">&rarr;</span>
              <input type="number" class="api-input" id="field_to_tier" value="11" min="1" max="12" placeholder="To 11" title="Target Tier" />
            </div>
          </div>
        </div>
      `;
    } else if (key === 'xp_calc') {
      formHtml = `
        <div class="api-form-row">
          <div class="api-field-group">
            <label class="api-field-label"><span>Skill Name <span class="api-field-required">*</span></span></label>
            <input type="text" class="api-input" id="field_skill" value="${ep.defaultParams.skill}" placeholder="e.g. Enchanting, Combat, Farming" required />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Starting &rarr; Target Level</span></label>
            <div style="display:flex; gap:0.4rem; align-items:center;">
              <input type="number" class="api-input" id="field_current_level" value="${ep.defaultParams.current_level}" min="0" max="60" placeholder="Lv 20" />
              <span style="font-weight:800; color:var(--api-text-muted);">&rarr;</span>
              <input type="number" class="api-input" id="field_target_level" value="${ep.defaultParams.target_level}" min="1" max="60" placeholder="Lv 50" />
            </div>
          </div>
        </div>
      `;
    } else if (key === 'minion_prod') {
      formHtml = `
        <datalist id="minionList">
          <option value="Slime Minion">
          <option value="Beetroot Minion">
          <option value="Diamond Minion">
          <option value="Wheat Minion">
          <option value="Carrot Minion">
          <option value="Potato Minion">
          <option value="Pumpkin Minion">
          <option value="Melon Minion">
          <option value="Mushroom Minion">
          <option value="Cocoa Beans Minion">
          <option value="Cactus Minion">
          <option value="Sugar Cane Minion">
          <option value="Cow Minion">
          <option value="Pig Minion">
          <option value="Chicken Minion">
          <option value="Sheep Minion">
          <option value="Rabbit Minion">
          <option value="Cobblestone Minion">
          <option value="Coal Minion">
          <option value="Iron Minion">
          <option value="Gold Minion">
          <option value="Lapis Lazuli Minion">
          <option value="Emerald Minion">
          <option value="Redstone Minion">
          <option value="Obsidian Minion">
          <option value="Ice Minion">
          <option value="End Stone Minion">
          <option value="Zombie Minion">
          <option value="Skeleton Minion">
          <option value="Spider Minion">
          <option value="Cave Spider Minion">
          <option value="Creeper Minion">
          <option value="Enderman Minion">
          <option value="Blaze Minion">
          <option value="Magma Cube Minion">
          <option value="Revenant Minion">
          <option value="Oak Log Minion">
          <option value="Spruce Log Minion">
          <option value="Birch Log Minion">
          <option value="Dark Oak Log Minion">
          <option value="Acacia Log Minion">
          <option value="Jungle Log Minion">
          <option value="Bamboo Minion">
          <option value="Duck Minion">
        </datalist>

        <div class="api-form-row">
          <div class="api-field-group" style="flex:2;">
            <label class="api-field-label"><span>Minion Name <span class="api-field-required">*</span></span></label>
            <input type="text" class="api-input" id="field_minion" list="minionList" value="${ep.defaultParams.minion}" placeholder="Search or select minion..." required />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Tier</span></label>
            <input type="number" class="api-input" id="field_tier" value="${ep.defaultParams.tier}" min="1" max="12" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label" title="Number of identical minions placed on island"><span>Setup Count</span></label>
            <input type="number" class="api-input" id="field_minionCount" value="${ep.defaultParams.count || 1}" min="1" max="35" placeholder="1 minion" />
          </div>
        </div>

        <div class="api-form-row">
          <div class="api-field-group" style="flex:1.5;">
            <label class="api-field-label"><span>Active Fuel</span></label>
            <select class="api-select" id="field_fuel">
              <option value="none">None (1.0x Base)</option>
              <option value="Enchanted Lava Bucket" selected>Enchanted Lava Bucket (+25% speed, Unlimited)</option>
              <option value="Hamster Wheel">Hamster Wheel (+40% speed, 24 Hours)</option>
              <option value="Foul Flesh">Foul Flesh (+80% speed, 4 Hours)</option>
              <option value="Catalyst">Catalyst (3.0x drops, 3 Hours)</option>
              <option value="Hyper Catalyst">Hyper Catalyst (4.0x drops, 6 Hours)</option>
              <option value="Enchanted Charcoal">Enchanted Charcoal (+20% speed, 36 Hours)</option>
              <option value="Enchanted Coal">Enchanted Coal (+10% speed, 24 Hours)</option>
              <option value="Coal Block">Coal Block (+5% speed, 5 Hours)</option>
              <option value="Enchanted Bread">Enchanted Bread (+5% speed, 12 Hours)</option>
              <option value="Coal">Coal (+5% speed, 30 Minutes)</option>
            </select>
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Duration (Hours)</span></label>
            <input type="number" class="api-input" id="field_hours" value="${ep.defaultParams.hours}" min="1" max="8760" />
            <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.35rem;">
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=1; document.getElementById('field_hours').dispatchEvent(new Event('input'));">1h</button>
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=12; document.getElementById('field_hours').dispatchEvent(new Event('input'));">12h</button>
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=24; document.getElementById('field_hours').dispatchEvent(new Event('input'));">24h</button>
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=48; document.getElementById('field_hours').dispatchEvent(new Event('input'));">48h</button>
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=168; document.getElementById('field_hours').dispatchEvent(new Event('input'));">7d</button>
              <button type="button" class="api-preset-chip" style="font-size:0.7rem; padding:0.15rem 0.4rem;" onclick="document.getElementById('field_hours').value=720; document.getElementById('field_hours').dispatchEvent(new Event('input'));">30d</button>
            </div>
          </div>
        </div>

        <div style="margin-top:0.75rem;">
          <label class="api-field-label" style="margin-bottom:0.4rem;"><span>Minion Upgrades & Spreadings</span></label>
          <div class="api-checkbox-group">
            <label class="api-checkbox-label">
              <input type="checkbox" id="field_superCompactor" ${ep.defaultParams.superCompactor ? 'checked' : ''} />
              <span>Super Compactor 3000 (Auto-crafts enchanted items)</span>
            </label>
            <label class="api-checkbox-label">
              <input type="checkbox" id="field_diamondSpreading" ${ep.defaultParams.diamondSpreading ? 'checked' : ''} />
              <span>Diamond Spreading (+Diamonds per action)</span>
            </label>
            <label class="api-checkbox-label">
              <input type="checkbox" id="field_potatoSpreading" ${ep.defaultParams.potatoSpreading ? 'checked' : ''} />
              <span>Potato Spreading (+Potatoes)</span>
            </label>
          </div>
        </div>
      `;
    } else if (key === 'pet_xp') {
      formHtml = `
        <div class="api-form-row">
          <div class="api-field-group">
            <label class="api-field-label"><span>Pet Name <span class="api-field-required">*</span></span></label>
            <input type="text" class="api-input" id="field_pet" value="${ep.defaultParams.pet}" placeholder="e.g. Ender Dragon, Golden Dragon" required />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Pet Rarity</span></label>
            <select class="api-select" id="field_petRarity">
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
              <option value="epic">Epic</option>
              <option value="rare">Rare</option>
              <option value="uncommon">Uncommon</option>
              <option value="common">Common</option>
            </select>
          </div>
        </div>

        <div class="api-form-row">
          <div class="api-field-group">
            <label class="api-field-label"><span>Starting Level</span></label>
            <input type="number" class="api-input" id="field_petCurrentLevel" value="${ep.defaultParams.current_level}" min="1" max="199" />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Target Level</span></label>
            <input type="number" class="api-input" id="field_petTargetLevel" value="${ep.defaultParams.target_level}" min="2" max="200" />
          </div>
        </div>
      `;
    } else if (key === 'recipe') {
      formHtml = `
        <div class="api-form-row">
          <div class="api-field-group">
            <label class="api-field-label"><span>Craft Item Name <span class="api-field-required">*</span></span></label>
            <input type="text" class="api-input" id="field_recipeItem" value="${ep.defaultParams.item}" placeholder="e.g. Super Compactor 3000, Hyperion" required />
          </div>
          <div class="api-field-group">
            <label class="api-field-label"><span>Craft Amount</span></label>
            <input type="number" class="api-input" id="field_recipeAmount" value="${ep.defaultParams.amount}" min="1" />
          </div>
        </div>
      `;
    }

    formContainer.innerHTML = `
      ${headerHtml}
      <div class="api-panel-body">
        <p style="margin:0; font-size:0.88rem; color:var(--api-text-muted); line-height:1.4;">${ep.description}</p>
        
        <!-- Presets -->
        <div class="api-presets-wrap">
          <span class="api-presets-label">Presets:</span>
          ${presetsHtml}
        </div>

        <!-- Form fields -->
        ${formHtml}
      </div>
    `;

    // Attach listeners to preset buttons
    formContainer.querySelectorAll('.api-preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-preset-idx'), 10);
        applyPreset(key, idx);
      });
    });

    // Attach listener to method dropdown
    const methodSelect = document.getElementById('field_httpMethod');
    if (methodSelect) {
      methodSelect.addEventListener('change', (e) => {
        activeHttpMode = e.target.value;
        if (requestMethodTag) requestMethodTag.textContent = activeHttpMode;
        updateLiveUrlPreview();
      });
    }

    // Attach listeners to inputs
    formContainer.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', updateLiveUrlPreview);
      input.addEventListener('change', updateLiveUrlPreview);
    });

    updateLiveUrlPreview();
  }

  // --- APPLY PRESET ---
  function applyPreset(endpointKey, presetIdx) {
    const ep = ENDPOINTS[endpointKey];
    if (!ep || !ep.presets || !ep.presets[presetIdx]) return;
    const preset = ep.presets[presetIdx];

    if (endpointKey === 'networth') {
      setInputValue('field_player', preset.params.player || '');
      setInputValue('field_profile', preset.params.profile || '');
    } else if (endpointKey === 'item_price') {
      setInputValue('field_item', preset.params.item || '');
      setInputValue('field_type', preset.params.type || 'all');
      setInputValue('field_amount', preset.params.amount || 1);
      setInputValue('field_kills', preset.params.kills || '');
      setInputValue('field_rarity', preset.params.rarity || '');
      setInputValue('field_level', preset.params.level || '');
      setInputValue('field_candy', preset.params.candy || '');
      setInputValue('field_from_tier', preset.params.from_tier !== undefined ? preset.params.from_tier : 0);
      setInputValue('field_to_tier', preset.params.to_tier !== undefined ? preset.params.to_tier : 11);
    } else if (endpointKey === 'xp_calc') {
      setInputValue('field_skill', preset.params.skill);
      setInputValue('field_current_level', preset.params.current_level);
      setInputValue('field_target_level', preset.params.target_level);
    } else if (endpointKey === 'minion_prod') {
      setInputValue('field_minion', preset.params.minion);
      setInputValue('field_tier', preset.params.tier);
      setInputValue('field_minionCount', preset.params.count || 1);
      setInputValue('field_fuel', preset.params.fuel);
      setInputValue('field_hours', preset.params.hours);
      setCheckboxValue('field_superCompactor', preset.params.superCompactor !== false);
      setCheckboxValue('field_diamondSpreading', preset.params.diamondSpreading === true);
      setCheckboxValue('field_potatoSpreading', preset.params.potatoSpreading === true);
    } else if (endpointKey === 'pet_xp') {
      setInputValue('field_pet', preset.params.pet);
      setInputValue('field_petRarity', preset.params.rarity);
      setInputValue('field_petCurrentLevel', preset.params.current_level);
      setInputValue('field_petTargetLevel', preset.params.target_level);
    } else if (endpointKey === 'recipe') {
      setInputValue('field_recipeItem', preset.params.item);
      setInputValue('field_recipeAmount', preset.params.amount);
    }

    updateLiveUrlPreview();
    showToast(`Applied preset: ${preset.label}`);
  }

  function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== undefined && val !== null) ? val : '';
  }

  function setCheckboxValue(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = Boolean(checked);
  }

  // --- PARAMETERS EXTRACTOR ---
  function getEndpointParams() {
    const ep = ENDPOINTS[activeEndpointKey];
    if (!ep) return {};

    const params = {};

    if (activeEndpointKey === 'networth') {
      const player = (document.getElementById('field_player')?.value || '').trim();
      const profile = (document.getElementById('field_profile')?.value || '').trim();
      if (player) params.player = player;
      if (profile) params.profile = profile;
    } else if (activeEndpointKey === 'item_price') {
      const item = (document.getElementById('field_item')?.value || '').trim();
      const type = document.getElementById('field_type')?.value;
      const amount = document.getElementById('field_amount')?.value;
      const kills = document.getElementById('field_kills')?.value;
      const rarity = document.getElementById('field_rarity')?.value;
      const level = document.getElementById('field_level')?.value;
      const candy = document.getElementById('field_candy')?.value;
      const fromTier = document.getElementById('field_from_tier')?.value;
      const toTier = document.getElementById('field_to_tier')?.value;

      if (item) params.item = item;
      if (type && type !== 'all') params.type = type;
      if (amount && parseInt(amount, 10) > 1) params.amount = parseInt(amount, 10);
      if (kills) params.kills = parseInt(kills, 10);
      if (rarity) params.rarity = rarity;
      if (level) params.level = parseInt(level, 10);
      if (candy) params.candy = parseInt(candy, 10);
      if (type === 'minions' || fromTier || toTier) {
        if (fromTier !== undefined && fromTier !== '') params.from_tier = parseInt(fromTier, 10);
        if (toTier !== undefined && toTier !== '') params.to_tier = parseInt(toTier, 10);
      }
    } else if (activeEndpointKey === 'xp_calc') {
      const skill = (document.getElementById('field_skill')?.value || '').trim();
      const cur = document.getElementById('field_current_level')?.value;
      const tar = document.getElementById('field_target_level')?.value;
      if (skill) params.skill = skill;
      if (cur) params.current_level = parseInt(cur, 10);
      if (tar) params.target_level = parseInt(tar, 10);
    } else if (activeEndpointKey === 'minion_prod') {
      const minion = (document.getElementById('field_minion')?.value || '').trim();
      const tier = document.getElementById('field_tier')?.value;
      const count = document.getElementById('field_minionCount')?.value;
      const fuel = (document.getElementById('field_fuel')?.value || '').trim();
      const hours = document.getElementById('field_hours')?.value;
      const sc = document.getElementById('field_superCompactor')?.checked;
      const ds = document.getElementById('field_diamondSpreading')?.checked;
      const ps = document.getElementById('field_potatoSpreading')?.checked;

      if (minion) params.minion = minion;
      if (tier) params.tier = parseInt(tier, 10);
      if (count && parseInt(count, 10) > 1) params.count = parseInt(count, 10);
      if (fuel && fuel !== 'none') params.fuel = fuel;
      if (hours) params.hours = parseFloat(hours);
      params.superCompactor = Boolean(sc);
      params.diamondSpreading = Boolean(ds);
      params.potatoSpreading = Boolean(ps);
    } else if (activeEndpointKey === 'pet_xp') {
      const pet = (document.getElementById('field_pet')?.value || '').trim();
      const rarity = document.getElementById('field_petRarity')?.value;
      const cur = document.getElementById('field_petCurrentLevel')?.value;
      const tar = document.getElementById('field_petTargetLevel')?.value;

      if (pet) params.pet = pet;
      if (rarity) params.rarity = rarity;
      if (cur) params.current_level = parseInt(cur, 10);
      if (tar) params.target_level = parseInt(tar, 10);
    } else if (activeEndpointKey === 'recipe') {
      const item = (document.getElementById('field_recipeItem')?.value || '').trim();
      const amount = document.getElementById('field_recipeAmount')?.value;

      if (item) params.item = item;
      if (amount && parseInt(amount, 10) > 1) params.amount = parseInt(amount, 10);
    }

    return params;
  }

  // --- BUILD URL ---
  function getFullRequestUrl() {
    const baseUrl = getBaseUrl();
    const ep = ENDPOINTS[activeEndpointKey];
    if (!ep) return baseUrl;

    const params = getEndpointParams();
    const query = new URLSearchParams();

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    }

    const qs = query.toString();
    return `${baseUrl}${ep.path}${qs ? '?' + qs : ''}`;
  }

  function generateCurlCommand() {
    const url = getFullRequestUrl();
    const apiKey = getApiKeyOverride() || 'YOUR_NEST_API_KEY';
    if (activeHttpMode === 'POST') {
      const baseUrl = getBaseUrl();
      const ep = ENDPOINTS[activeEndpointKey];
      const params = getEndpointParams();
      return `curl -X POST "${baseUrl}${ep.path}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(params, null, 2)}'`;
    }
    return `curl -X GET "${url}" \\
  -H "x-api-key: ${apiKey}"`;
  }

  function updateLiveUrlPreview() {
    if (!requestUrlPreview) return;
    const url = getFullRequestUrl();
    requestUrlPreview.textContent = url;
    if (requestMethodTag) requestMethodTag.textContent = activeHttpMode;
  }

  // --- SERVER STATUS CHECK (Health Ping) ---
  async function testServerConnection() {
    if (!serverStatusBadge) return;
    serverStatusBadge.className = 'api-status-badge checking';
    serverStatusBadge.innerHTML = '<span class="api-status-dot"></span> Checking...';

    const baseUrl = getBaseUrl();
    const rawTarget = `${baseUrl}/api/health`;
    const resolved = resolveRequestTarget(rawTarget);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      let res = await fetch(resolved.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...resolved.headers
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const d = await res.json().catch(() => ({}));
        let label = 'Online';
        if (typeof d.uptime === 'number') {
          label = `Online (${Math.round(d.uptime)}s uptime)`;
        } else if (d.version) {
          label = `Online (v${d.version})`;
        } else if (d.status === 'healthy') {
          label = 'Online (Healthy)';
        }

        serverStatusBadge.className = 'api-status-badge online';
        serverStatusBadge.innerHTML = `<span class="api-status-dot"></span> ${label}${resolved.proxied ? ' (Proxy)' : ''}`;
        return;
      } else {
        serverStatusBadge.className = 'api-status-badge offline';
        serverStatusBadge.innerHTML = '<span class="api-status-dot"></span> Status ' + res.status;
      }
    } catch (err) {
      clearTimeout(timeoutId);

      // If direct fetch was attempted and failed (e.g. Mixed Content), auto fallback to proxy!
      if (!resolved.proxied) {
        try {
          const proxyController = new AbortController();
          const proxyTimeoutId = setTimeout(() => proxyController.abort(), 10000);
          const proxyRes = await fetch(`/api/tester-proxy?target=${encodeURIComponent(rawTarget)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-Guides-Client': 'craftersmc-web'
            },
            signal: proxyController.signal
          });
          clearTimeout(proxyTimeoutId);

          if (proxyRes.ok) {
            const d = await proxyRes.json().catch(() => ({}));
            const checkbox = document.getElementById('useProxyCheckbox');
            if (checkbox) checkbox.checked = true;
            localStorage.setItem(STORAGE_USE_PROXY, 'true');

            let label = 'Online (via Proxy)';
            if (typeof d.uptime === 'number') {
              label = `Online (${Math.round(d.uptime)}s uptime via Proxy)`;
            }
            serverStatusBadge.className = 'api-status-badge online';
            serverStatusBadge.innerHTML = `<span class="api-status-dot"></span> ${label}`;
            showToast('Direct HTTP blocked by browser; switched to HTTPS Proxy.');
            return;
          }
        } catch (_) {}
      }

      serverStatusBadge.className = 'api-status-badge offline';
      const isMixedContent = window.location.protocol === 'https:' && baseUrl.startsWith('http://');
      serverStatusBadge.innerHTML = `<span class="api-status-dot"></span> ${isMixedContent ? 'Mixed-Content Blocked' : 'Offline / Timed Out'}`;
    }
  }

  function updateServerBadge() {
    testServerConnection();
  }

  // --- EXECUTE API REQUEST ---
  async function executeApiRequest() {
    if (sendRequestBtn) {
      sendRequestBtn.classList.add('loading');
      sendRequestBtn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite;">sync</span> Fetching...';
    }

    const tStart = performance.now();
    const baseUrl = getBaseUrl();
    const ep = ENDPOINTS[activeEndpointKey];
    const params = getEndpointParams();

    // LIVE FETCH
    try {
      let targetUrl = getFullRequestUrl();
      if (activeHttpMode === 'POST') {
        targetUrl = `${baseUrl}${ep.path}`;
      }

      const resolved = resolveRequestTarget(targetUrl);
      const options = {
        method: activeHttpMode,
        headers: {
          'Accept': 'application/json',
          ...resolved.headers
        }
      };

      if (activeHttpMode === 'POST') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(params);
      }

      let response;
      try {
        response = await fetch(resolved.url, options);
      } catch (fetchErr) {
        // If direct fetch failed (e.g. Mixed Content) and wasn't proxied, auto retry via proxy
        if (!resolved.proxied) {
          const retryUrl = `/api/tester-proxy?target=${encodeURIComponent(targetUrl)}`;
          options.headers['X-Guides-Client'] = 'craftersmc-web';
          response = await fetch(retryUrl, options);
          const checkbox = document.getElementById('useProxyCheckbox');
          if (checkbox) checkbox.checked = true;
          localStorage.setItem(STORAGE_USE_PROXY, 'true');
          showToast('Direct fetch blocked by browser; auto-routed via Cloudflare Proxy.');
        } else {
          throw fetchErr;
        }
      }

      const tEnd = performance.now();
      const latency = Math.round(tEnd - tStart);

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      let rawText = '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        rawText = await response.text();
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = { success: false, raw: rawText };
        }
      }

      const size = new Blob([JSON.stringify(data)]).size;
      handleResponseSuccess(data, response.status, latency, size);
    } catch (err) {
      const tEnd = performance.now();
      const latency = Math.round(tEnd - tStart);
      handleResponseError(err, latency);
    } finally {
      resetSendBtn();
    }
  }

  function resetSendBtn() {
    if (!sendRequestBtn) return;
    sendRequestBtn.classList.remove('loading');
    sendRequestBtn.innerHTML = '<span class="material-icons">send</span> Send API Request';
  }

  // --- HANDLE RESPONSE SUCCESS ---
  function handleResponseSuccess(data, status, latencyMs, sizeBytes) {
    lastResponseData = data;
    lastResponseStatus = status;
    lastResponseTime = latencyMs;
    lastResponseSize = sizeBytes;

    if (resStatusBadge) {
      resStatusBadge.textContent = `${status} ${status === 200 ? 'OK' : 'Response'}`;
      resStatusBadge.className = `api-res-badge ${status === 200 ? 'status-200' : 'status-error'}`;
      resStatusBadge.style.display = 'inline-flex';
    }

    if (resTimeBadge) {
      resTimeBadge.textContent = `${latencyMs} ms`;
      resTimeBadge.style.display = 'inline-flex';
    }

    if (resSizeBadge) {
      resSizeBadge.textContent = formatBytes(sizeBytes);
      resSizeBadge.style.display = 'inline-flex';
    }

    if (rawJsonOutput) {
      rawJsonOutput.textContent = JSON.stringify(data, null, 2);
    }

    renderVisualResponse(data);

    if (activeViewTab === 'docs') {
      switchViewTab('visual');
    }
  }

  // --- HANDLE RESPONSE ERROR (CORS / OFFLINE) ---
  function handleResponseError(err, latencyMs) {
    lastResponseData = { error: err.message, stack: err.stack };
    lastResponseStatus = 0;
    lastResponseTime = latencyMs;
    lastResponseSize = 0;

    if (resStatusBadge) {
      resStatusBadge.textContent = 'Connection / CORS Error';
      resStatusBadge.className = 'api-res-badge status-error';
      resStatusBadge.style.display = 'inline-flex';
    }

    if (resTimeBadge) {
      resTimeBadge.textContent = `${latencyMs} ms`;
      resTimeBadge.style.display = 'inline-flex';
    }

    if (resSizeBadge) {
      resSizeBadge.style.display = 'none';
    }

    const baseUrl = getBaseUrl();
    const isMixedContent = window.location.protocol === 'https:' && baseUrl.startsWith('http://');

    if (rawJsonOutput) {
      rawJsonOutput.textContent = JSON.stringify({
        error: "Failed to fetch from Feather Bot REST API",
        message: err.message,
        isMixedContentBlocked: isMixedContent,
        hint: isMixedContent
          ? "Browsers block direct HTTP requests from HTTPS pages (Mixed Content). Enable 'HTTPS Proxy' to connect seamlessly via Cloudflare Edge."
          : `Ensure Feather Bot API server is running on ${baseUrl} with port open`,
        command: "npm run api  # or: node api/server.js"
      }, null, 2);
    }

    if (responseVisualWrap) {
      responseVisualWrap.innerHTML = `
        <div class="api-troubleshoot-banner">
          <div class="api-troubleshoot-header">
            <span class="material-icons" style="font-size:20px;">error_outline</span>
            <span>Could not connect to Feather Bot API at <code>${escapeHtml(baseUrl)}</code></span>
          </div>
          <p style="margin:0; font-size:0.86rem; color:var(--api-text); line-height:1.5;">
            ${isMixedContent ? `
              <strong>Mixed Content Blocked:</strong> Your browser blocked this request because this page was loaded securely over HTTPS, but the API endpoint is plain HTTP (<code>${escapeHtml(baseUrl)}</code>).
              <br>Turn on the <strong>HTTPS Proxy</strong> toggle in the server bar to route requests safely through Cloudflare edge.
            ` : `
              The browser was unable to complete the request. Common causes:
              <br>&bull; The API server on port <strong>4994</strong> is currently stopped or firewalled.
              <br>&bull; CORS was blocked by your browser because the server wasn't configured for this origin.
            `}
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center; margin-top:0.6rem;">
            <button type="button" class="api-server-btn" onclick="const cb = document.getElementById('useProxyCheckbox'); if(cb) { cb.checked = true; localStorage.setItem('feather_api_use_proxy', 'true'); } window.testServerConnection();">
              <span class="material-icons" style="font-size:16px;">shield</span>
              <span>Enable Proxy &amp; Ping</span>
            </button>
            <button type="button" class="api-server-btn" onclick="window.testServerConnection();">
              <span class="material-icons" style="font-size:16px;">refresh</span>
              <span>Retry Ping</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  // --- RENDER VISUAL RESPONSE PER ENDPOINT ---
  function renderVisualResponse(data) {
    if (!responseVisualWrap) return;

    if (!data || data.success === false) {
      let profilesHtml = '';
      if (Array.isArray(data.availableProfiles) && data.availableProfiles.length > 0) {
        profilesHtml = `
          <div style="margin-top:0.75rem;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--api-text-muted); margin-bottom:0.35rem;">Available Profiles for this Player:</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
              ${data.availableProfiles.map(p => `
                <button type="button" class="api-preset-chip" onclick="document.getElementById('field_profile').value='${escapeHtml(p)}'; document.getElementById('sendRequestBtn').click();">
                  ${escapeHtml(p)}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      responseVisualWrap.innerHTML = `
        <div class="api-hero-metric" style="border-color:var(--api-red);">
          <div class="api-metric-label" style="color:var(--api-red);">
            <span class="material-icons">error</span> API Error Response
          </div>
          <div style="font-size:1rem; font-weight:700; color:var(--api-text); margin-top:0.4rem;">
            ${escapeHtml(data.error || data.message || 'The API returned an unsuccessful status.')}
          </div>
          ${profilesHtml}
        </div>
      `;
      return;
    }

    if (activeEndpointKey === 'networth') {
      renderNetworthVisual(data);
    } else if (activeEndpointKey === 'item_price') {
      renderItemPriceVisual(data);
    } else if (activeEndpointKey === 'xp_calc') {
      renderXpCalcVisual(data);
    } else if (activeEndpointKey === 'minion_prod') {
      renderMinionProdVisual(data);
    } else if (activeEndpointKey === 'pet_xp') {
      renderPetXpVisual(data);
    } else if (activeEndpointKey === 'recipe') {
      renderRecipeVisual(data);
    }
  }

  // --- 1. NETWORTH VISUAL ---
  function renderNetworthVisual(d) {
    const nw = d.networth || {};
    const playerName = typeof d.player === 'string' ? d.player : d.player?.username || 'Player';
    const profileName = d.profile?.name || d.profile?.cuteName || 'Profile';
    const gameMode = d.profile?.gameMode || 'NORMAL';
    const categories = d.categories || {};
    const topItems = d.topItems || [];

    const totalCoins = nw.totalNetworth ?? nw.total ?? 0;
    const purseCoins = nw.purseCoins ?? 0;
    const bankCoins = nw.bankCoins ?? 0;
    const liquidCoins = nw.liquidCoins ?? nw.liquidCoinsTotal ?? (purseCoins + bankCoins);
    const storageCoins = nw.storageItemsTotal ?? Math.max(0, totalCoins - liquidCoins);

    let catHtml = '';
    for (const [key, c] of Object.entries(categories)) {
      const val = c.totalValue || 0;
      const count = c.itemCount || (c.items ? c.items.length : 0);
      const percent = totalCoins > 0 ? ((val / totalCoins) * 100).toFixed(1) : 0;
      const label = c.label || key.replace(/_/g, ' ').toUpperCase();
      catHtml += `
        <div class="api-cat-row">
          <div class="api-cat-header">
            <span>${escapeHtml(label)} <span style="font-size:0.75rem; color:var(--api-text-muted);">(${count} items)</span></span>
            <span style="font-family:'JetBrains Mono'; font-weight:800;">${val.toLocaleString()} coins (${percent}%)</span>
          </div>
          <div class="api-cat-bar-bg">
            <div class="api-cat-bar-fill" style="width:${Math.min(100, Math.max(2, percent))}%;"></div>
          </div>
        </div>
      `;
    }

    const topItemsRows = topItems.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>x${item.count || 1}</td>
        <td style="font-family:'JetBrains Mono'; font-weight:800; color:var(--api-yellow);">${(item.price ?? item.totalPrice ?? 0).toLocaleString()}</td>
        <td><span class="api-res-badge size">${escapeHtml(item.container || 'Inventory')}</span></td>
        <td><span class="api-res-badge time" style="font-size:0.72rem;">${escapeHtml(item.source || item.priceSource || 'Valuation')}</span></td>
      </tr>
    `).join('');

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Hero Total Networth -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">account_balance_wallet</span>
            <span>Total Networth — ${escapeHtml(playerName)} [${escapeHtml(profileName)}]</span>
          </div>
          <div class="api-metric-value">${totalCoins.toLocaleString()} coins</div>
          <div class="api-metric-sub">
            Liquid Coins: <strong>${liquidCoins.toLocaleString()}</strong> &bull; Total Items Valued: <strong>${nw.totalItemCount || 'All'}</strong>
          </div>
        </div>

        <!-- Coins Distribution Sub-grid -->
        <div class="api-stats-card-grid">
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Purse Coins</div>
            <div class="api-sub-metric-value" style="color:#22c55e;">${purseCoins.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Bank Coins</div>
            <div class="api-sub-metric-value" style="color:#38bdf8;">${bankCoins.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Storage Items Value</div>
            <div class="api-sub-metric-value" style="color:var(--api-purple);">${storageCoins.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Game Mode</div>
            <div class="api-sub-metric-value" style="font-size:0.9rem;">${escapeHtml(gameMode.toUpperCase())}</div>
          </div>
        </div>

        <!-- Categories Breakdown -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">pie_chart</span>
            <span>Category Valuations Breakdown</span>
          </div>
          <div class="api-cat-list" style="margin-top:0.5rem;">
            ${catHtml}
          </div>
        </div>

        <!-- Top Valued Items -->
        ${topItems.length > 0 ? `
          <div class="api-hero-metric">
            <div class="api-metric-label">
              <span class="material-icons">star</span>
              <span>Top Valued Assets</span>
            </div>
            <div class="api-table-wrap" style="margin-top:0.5rem;">
              <table class="api-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Value</th>
                    <th>Container</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  ${topItemsRows}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // --- 2. ITEM PRICE VISUAL ---
  function renderItemPriceVisual(d) {
    const recPrice = d.recommendedTotalPrice ?? d.recommendedUnitPrice ?? d.totalPrice ?? 0;
    const recSource = d.recommendedSource || d.source || 'Valuation Engine';
    const bz = d.bazaar;
    const rec = d.recipe;
    const auc = d.auction;
    const npc = d.npcPrice;

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Recommended Price Hero -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">stars</span>
            <span>${escapeHtml(d.item || d.rawQuery || 'Item')} &bull; Qty: ${d.quantity || 1}</span>
          </div>
          <div class="api-metric-value">${recPrice.toLocaleString()} coins</div>
          <div class="api-metric-sub">
            Recommended Source: <span class="api-res-badge time" style="font-weight:800;">${escapeHtml(recSource)}</span>
            ${d.kills ? `&bull; Kill Bonus: <strong>+${(d.killBonus || 0).toLocaleString()} coins</strong>` : ''}
          </div>
        </div>

        <!-- Market Cards Grid -->
        <div class="api-stats-card-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <!-- Bazaar Market -->
          <div class="api-sub-metric">
            <div class="api-sub-metric-title" style="display:flex; justify-content:space-between;">
              <span>Bazaar Market</span>
              <span class="material-icons" style="font-size:16px;">storefront</span>
            </div>
            ${bz && bz.found ? `
              <div class="api-sub-metric-value" style="color:#38bdf8;">${(bz.instantSellPrice || bz.sellOfferPrice || 0).toLocaleString()} coins</div>
              <div style="font-size:0.75rem; color:var(--api-text-muted); margin-top:0.25rem;">
                Instant Sell: <strong>${(bz.instantSellPrice || 0).toLocaleString()}</strong><br>
                Instant Buy: <strong>${(bz.instantBuyPrice || 0).toLocaleString()}</strong><br>
                Spread: <strong>${bz.spreadPercent || 0}%</strong>
              </div>
            ` : `<div style="font-size:0.85rem; color:var(--api-text-muted); margin-top:0.4rem;">Not actively traded on Bazaar</div>`}
          </div>

          <!-- Recipe Crafting -->
          <div class="api-sub-metric">
            <div class="api-sub-metric-title" style="display:flex; justify-content:space-between;">
              <span>Crafting Recipe</span>
              <span class="material-icons" style="font-size:16px;">handyman</span>
            </div>
            ${rec && rec.found ? `
              <div class="api-sub-metric-value" style="color:#4ade80;">${(rec.craftCost || 0).toLocaleString()} coins</div>
              <div style="font-size:0.75rem; color:var(--api-text-muted); margin-top:0.25rem;">
                Market Value: <strong>${(rec.marketValue || 0).toLocaleString()}</strong><br>
                Profit: <strong>${(rec.netProfit || 0).toLocaleString()}</strong> (${rec.profitMarginPercent || 0}%)
              </div>
            ` : `<div style="font-size:0.85rem; color:var(--api-text-muted); margin-top:0.4rem;">No crafting recipe found</div>`}
          </div>

          <!-- Auction House -->
          <div class="api-sub-metric">
            <div class="api-sub-metric-title" style="display:flex; justify-content:space-between;">
              <span>Auction House</span>
              <span class="material-icons" style="font-size:16px;">gavel</span>
            </div>
            ${auc && auc.found ? `
              <div class="api-sub-metric-value" style="color:var(--api-yellow);">${(auc.averagePrice || 0).toLocaleString()} coins</div>
              <div style="font-size:0.75rem; color:var(--api-text-muted); margin-top:0.25rem;">
                7d Average &bull; ${auc.salesCount || 0} sales
              </div>
            ` : `<div style="font-size:0.85rem; color:var(--api-text-muted); margin-top:0.4rem;">No auction listings</div>`}
          </div>

          <!-- NPC Price -->
          <div class="api-sub-metric">
            <div class="api-sub-metric-title" style="display:flex; justify-content:space-between;">
              <span>NPC Sell Price</span>
              <span class="material-icons" style="font-size:16px;">person</span>
            </div>
            <div class="api-sub-metric-value" style="color:var(--api-text);">
              ${npc && npc.totalPrice ? npc.totalPrice.toLocaleString() + ' coins' : '0 coins'}
            </div>
            <div style="font-size:0.75rem; color:var(--api-text-muted); margin-top:0.25rem;">
              Unit Price: ${(npc?.unitPrice || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <!-- Minion Tier Breakdown (if present) -->
        ${d.tierBreakdown ? `
          <div class="api-hero-metric">
            <div class="api-metric-label">
              <span class="material-icons">precision_manufacturing</span>
              <span>Minion Tier Upgrade Breakdown (Tier ${d.fromTier || 0} &rarr; ${d.toTier || 11})</span>
            </div>
            <div style="font-size:0.88rem; color:var(--api-text-muted); margin-top:0.3rem;">
              Buy Order Cost: <strong>${(d.buyOrderCost || 0).toLocaleString()} coins</strong> &bull; Instant Buy Cost: <strong>${(d.instantBuyCost || 0).toLocaleString()} coins</strong>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // --- 3. XP & SKILL VISUAL ---
  function renderXpCalcVisual(d) {
    const bottles = d.bottlesNeeded || d.bottles || {};
    const xpReq = d.xpRequired ?? d.adjustedXpNeeded ?? d.rawXpNeeded ?? 0;
    const pct = d.progressPercentage !== undefined ? (d.progressPercentage * 100).toFixed(1) : (d.progressPercent || 0);

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Hero XP Overview -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">psychology</span>
            <span>Skill Leveling &bull; ${escapeHtml(d.skill || 'Skill')} (Level ${d.currentLevel || 0} &rarr; ${d.targetLevel || 50})</span>
          </div>
          <div class="api-metric-value" style="color:#c084fc;">
            ${xpReq.toLocaleString()} XP Needed
          </div>
          <div class="api-metric-sub">
            Target Total XP: <strong>${(d.targetXp || 0).toLocaleString()}</strong> &bull; Current Progress: <strong>${pct}%</strong>
          </div>

          <!-- Progress Bar -->
          <div style="margin-top:0.75rem;">
            <div class="api-cat-bar-bg" style="height:10px;">
              <div class="api-cat-bar-fill" style="width:${Math.min(100, Math.max(1, pct))}%; background:#c084fc;"></div>
            </div>
          </div>
        </div>

        <!-- Experience Bottles Grid -->
        <div class="api-stats-card-grid">
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Colossal Bottles (1.25M XP)</div>
            <div class="api-sub-metric-value" style="color:#fb923c;">${(bottles.colossal?.bottles ?? bottles.colossal?.count ?? 0).toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Titanic Bottles (260k XP)</div>
            <div class="api-sub-metric-value" style="color:#c084fc;">${(bottles.titanic?.bottles ?? bottles.titanic?.count ?? 0).toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Grand Bottles (1.5k XP)</div>
            <div class="api-sub-metric-value" style="color:#38bdf8;">${(bottles.grand?.bottles ?? bottles.grand?.count ?? 0).toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Normal Bottles (10 XP)</div>
            <div class="api-sub-metric-value">${(bottles.normal?.bottles ?? bottles.normal?.count ?? 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  // --- 4. MINION PROD VISUAL ---
  function renderMinionProdVisual(d) {
    const drops = d.producedItems || d.drops || [];
    const earnings = d.summary || d.estimatedEarnings || {};
    const npcTotal = earnings.totalNpcRevenue ?? earnings.npcTotal ?? 0;
    const bzInstant = earnings.totalBazaarInstantSellRevenue ?? earnings.bazaarInstantTotal ?? 0;
    const bzOffer = earnings.totalBazaarSellOfferRevenue ?? earnings.bazaarOfferTotal ?? 0;
    const bestMethod = earnings.bestRevenueMethod || (bzOffer > npcTotal ? 'Bazaar Sell Offer' : 'NPC Sell');
    const hourlyEst = earnings.hourlyEarningsEstimate || Math.round(Math.max(npcTotal, bzOffer) / (d.durationHours || 24));
    const upgrades = d.upgrades || {};
    const minionCount = d.minionCount || 1;

    const dropsRows = drops.map(drop => {
      const dropName = drop.item || drop.name || 'Item';
      const count = drop.count ?? drop.quantity ?? 0;
      const hourly = drop.hourlyCount !== undefined ? `(${drop.hourlyCount}/hr)` : '';
      const stackText = drop.stackText || `${Math.round(count)} items`;
      const npcVal = drop.npcTotalValue ?? drop.npcTotal ?? 0;
      const bzValInstant = drop.bazaarTotalValue?.instantSell ?? drop.bazaarInstantTotal ?? 0;
      const bzValOffer = drop.bazaarTotalValue?.sellOffer ?? drop.bazaarTotal ?? 0;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(dropName)}</strong>
            ${hourly ? `<div style="font-size:0.75rem; color:var(--api-text-muted);">${hourly}</div>` : ''}
          </td>
          <td style="font-family:'JetBrains Mono';">${count.toLocaleString()}</td>
          <td><span class="api-res-badge size" style="font-size:0.75rem;">${escapeHtml(stackText)}</span></td>
          <td style="font-family:'JetBrains Mono'; font-weight:700;">${npcVal.toLocaleString()}</td>
          <td style="font-family:'JetBrains Mono'; color:#38bdf8;">${bzValInstant ? bzValInstant.toLocaleString() : '—'}</td>
          <td style="font-family:'JetBrains Mono'; font-weight:800; color:var(--api-yellow);">${bzValOffer ? bzValOffer.toLocaleString() : '—'}</td>
        </tr>
      `;
    }).join('');

    const maxRevenue = Math.max(npcTotal, bzOffer, bzInstant);

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Minion Overview Hero -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">precision_manufacturing</span>
            <span>
              ${minionCount > 1 ? `<strong>${minionCount}x</strong> ` : ''}
              ${escapeHtml(d.minion || 'Minion')} Tier ${d.tier || 11} &bull; ${d.durationHours || 24} Hours
            </span>
          </div>
          <div class="api-metric-value" style="color:var(--api-yellow);">
            ${maxRevenue.toLocaleString()} coins
          </div>
          <div class="api-metric-sub">
            Best Strategy: <span class="api-res-badge time" style="font-weight:800; color:#22c55e;">${escapeHtml(bestMethod)}</span>
            &bull; Estimated Hourly: <strong>${hourlyEst.toLocaleString()} coins/hr</strong>
            ${minionCount > 1 ? `&bull; Setup Size: <strong>${minionCount} minions</strong>` : ''}
          </div>

          <!-- Active Upgrades Badges -->
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.75rem;">
            <span class="api-res-badge ${upgrades.superCompactor ? 'status-ok' : 'size'}">
              Super Compactor: ${upgrades.superCompactor ? 'ON' : 'OFF'}
            </span>
            <span class="api-res-badge ${upgrades.diamondSpreading ? 'status-ok' : 'size'}">
              Diamond Spreading: ${upgrades.diamondSpreading ? 'ON' : 'OFF'}
            </span>
            <span class="api-res-badge ${upgrades.potatoSpreading ? 'status-ok' : 'size'}">
              Potato Spreading: ${upgrades.potatoSpreading ? 'ON' : 'OFF'}
            </span>
            <span class="api-res-badge time">
              Fuel: ${escapeHtml(d.fuel || 'None')} (${d.fuelMultiplier || 1}x)
            </span>
          </div>
        </div>

        <div class="api-stats-card-grid">
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">NPC Sell Revenue</div>
            <div class="api-sub-metric-value">${npcTotal.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Bazaar Instant Sell</div>
            <div class="api-sub-metric-value" style="color:#38bdf8;">${bzInstant.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Bazaar Sell Offer</div>
            <div class="api-sub-metric-value" style="color:var(--api-yellow);">${bzOffer.toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Duration / Speed</div>
            <div class="api-sub-metric-value" style="font-size:0.9rem;">${d.durationHours || 24}h (${d.fuelMultiplier || 1}x Speed)</div>
          </div>
        </div>

        <!-- Harvest Table -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">inventory</span>
            <span>Harvest Yields Breakdown (${drops.length} unique items)</span>
          </div>
          <div class="api-table-wrap" style="margin-top:0.5rem;">
            <table class="api-table">
              <thead>
                <tr>
                  <th>Produced Item</th>
                  <th>Quantity</th>
                  <th>Stacks</th>
                  <th>NPC Total</th>
                  <th>Bazaar Instant</th>
                  <th>Bazaar Offer</th>
                </tr>
              </thead>
              <tbody>
                ${dropsRows || '<tr><td colspan="6" style="text-align:center;">No items produced</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --- 5. PET XP VISUAL ---
  function renderPetXpVisual(d) {
    const candies = d.candiesNeeded || {};
    const ultCandy = candies.ultimateBeetrootCandy || d.candies?.ultimate;
    const regCandy = candies.beetrootCandy;

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Pet Hero -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">pets</span>
            <span>${escapeHtml(d.pet || 'Pet')} [${escapeHtml((d.rarity || 'Pet').toUpperCase())}] &bull; Lv ${d.currentLevel || 1} &rarr; ${d.targetLevel || 100}</span>
          </div>
          <div class="api-metric-value" style="color:#f472b6;">
            ${(d.xpNeeded || 0).toLocaleString()} XP Needed
          </div>
          <div class="api-metric-sub">
            Target Total XP: <strong>${(d.targetXp || 0).toLocaleString()}</strong> &bull; Current Level XP: <strong>${(d.currentXp || 0).toLocaleString()}</strong>
          </div>
        </div>

        <!-- Candy Optimization Cards -->
        <div class="api-stats-card-grid">
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Ultimate Beetroot Candies (1M XP)</div>
            <div class="api-sub-metric-value" style="color:#22c55e;">${(ultCandy?.count ?? ultCandy?.candiesUsed ?? 0).toLocaleString()}</div>
          </div>
          <div class="api-sub-metric">
            <div class="api-sub-metric-title">Regular Beetroot Candies (100k XP)</div>
            <div class="api-sub-metric-value" style="color:#38bdf8;">${(regCandy?.count ?? 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  // --- 6. RECIPE VISUAL ---
  function renderRecipeVisual(d) {
    const baseUrl = getBaseUrl();
    const itemParam = encodeURIComponent(d.item || 'Super Compactor 3000');
    const imageUrl = `${baseUrl}/api/recipe/image?item=${itemParam}`;
    const direct = d.directIngredients || [];
    const raw = d.rawIngredients || [];

    const directPills = direct.map(ing => `
      <div class="api-preset-chip" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
        <strong>${ing.quantity.toLocaleString()}x</strong> ${escapeHtml(ing.name)}
        <span style="color:var(--api-text-muted);">(${escapeHtml(ing.stackText || '')})</span>
      </div>
    `).join('');

    const rawPills = raw.map(ing => `
      <div class="api-preset-chip" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
        <strong>${ing.quantity.toLocaleString()}x</strong> ${escapeHtml(ing.name)}
        <span style="color:var(--api-text-muted);">(${escapeHtml(ing.stackText || '')} &bull; ${escapeHtml(ing.inventoryText || '')})</span>
      </div>
    `).join('');

    responseVisualWrap.innerHTML = `
      <div class="api-visual-container">
        <!-- Recipe Header & Financials -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">handyman</span>
            <span>Recipe Blueprint &bull; ${escapeHtml(d.item || 'Item')} (x${d.quantity || 1})</span>
          </div>
          <div class="api-metric-value" style="color:#4ade80;">
            ${(d.craftCost || 0).toLocaleString()} coins <span style="font-size:0.9rem; color:var(--api-text-muted);">Craft Cost</span>
          </div>
          <div class="api-metric-sub">
            Market Value: <strong>${(d.marketValue || 0).toLocaleString()}</strong>
            &bull; Net Profit: <strong>${(d.netProfit || 0).toLocaleString()}</strong> (${d.profitMarginPercent || 0}%)
          </div>
        </div>

        <!-- Recipe Grid Image (Live from /api/recipe/image) -->
        <div class="api-recipe-img-box">
          <div style="font-size:0.82rem; font-weight:800; text-transform:uppercase; color:#111827; display:flex; align-items:center; gap:0.4rem;">
            <span class="material-icons" style="font-size:18px;">grid_on</span>
            <span>Live Rendered Crafting Grid Image Stream (PNG)</span>
          </div>
          <img class="api-recipe-img" src="${imageUrl}" alt="Recipe visual grid" onerror="this.onerror=null; this.src='assets/cmc-guides.png'; this.style.maxWidth='96px';" />
          <div style="font-size:0.75rem; color:#475569; font-family:'JetBrains Mono';">GET ${imageUrl}</div>
        </div>

        <!-- Direct Ingredients -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">format_list_bulleted</span>
            <span>Direct Crafting Ingredients</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.4rem;">
            ${directPills}
          </div>
        </div>

        <!-- Raw Base Ingredients -->
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">layers</span>
            <span>Raw Base Materials (Uncrafted Inventories)</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.4rem;">
            ${rawPills}
          </div>
        </div>

        <!-- ASCII Tree -->
        ${d.treeText ? `
          <div class="api-hero-metric">
            <div class="api-metric-label">
              <span class="material-icons">account_tree</span>
              <span>Crafting Hierarchy Tree</span>
            </div>
            <pre class="api-tree-box">${escapeHtml(d.treeText)}</pre>
          </div>
        ` : ''}
      </div>
    `;
  }

  // --- TAB SWITCHER ---
  function switchViewTab(tab) {
    activeViewTab = tab;
    [viewTabVisual, viewTabJson, viewTabDocs].forEach(t => t && t.classList.remove('active'));
    [responseVisualWrap, responseJsonWrap, responseDocsWrap].forEach(w => w && (w.style.display = 'none'));

    if (tab === 'visual') {
      if (viewTabVisual) viewTabVisual.classList.add('active');
      if (responseVisualWrap) responseVisualWrap.style.display = 'block';
    } else if (tab === 'json') {
      if (viewTabJson) viewTabJson.classList.add('active');
      if (responseJsonWrap) responseJsonWrap.style.display = 'block';
    } else if (tab === 'docs') {
      if (viewTabDocs) viewTabDocs.classList.add('active');
      if (responseDocsWrap) {
        responseDocsWrap.style.display = 'block';
        renderDocsView();
      }
    }
  }

  // --- RENDER INLINE DOCUMENTATION ---
  function renderDocsView() {
    if (!responseDocsWrap) return;
    const ep = ENDPOINTS[activeEndpointKey];
    if (!ep) return;

    responseDocsWrap.innerHTML = `
      <div class="api-visual-container">
        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">menu_book</span>
            <span>Endpoint Specification &bull; ${escapeHtml(ep.name)}</span>
          </div>
          <div style="font-family:'JetBrains Mono'; font-weight:800; font-size:1.1rem; color:var(--api-accent); margin-top:0.3rem;">
            GET / POST ${ep.path}
          </div>
          <p style="margin:0.4rem 0 0; font-size:0.88rem; color:var(--api-text-muted); line-height:1.5;">
            ${escapeHtml(ep.description)}
          </p>
        </div>

        <div class="api-hero-metric">
          <div class="api-metric-label">
            <span class="material-icons">integration_instructions</span>
            <span>JavaScript Integration Example</span>
          </div>
          <pre class="api-tree-box">async function fetch${ep.name.replace(/[^a-zA-Z]/g, '')}() {
  const response = await fetch("${getFullRequestUrl()}");
  const data = await response.json();
  if (data.success) {
    console.log("Response:", data);
  }
}</pre>
        </div>
      </div>
    `;
  }

  // --- HELPERS ---
  function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg || 'Copied to clipboard!');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(msg || 'Copied to clipboard!');
    });
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  // Expose ping tester to window
  window.testServerConnection = testServerConnection;

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
