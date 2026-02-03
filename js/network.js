const apiPath = '/network-status';
const CACHE_KEY = 'network-status-cache';
const TTL = 60 * 1000;

function renderKV(container, obj) {
    container.innerHTML = '';
    for (const [k, v] of Object.entries(obj)) {
        const row = document.createElement('div');
        row.className = 'kv';

        const key = document.createElement('div'); key.className = 'k';
        key.textContent = k;

        const val = document.createElement('div'); val.className = 'v';
        if (v === null) { val.textContent = 'null'; }
        else if (typeof v === 'object') {
            const details = document.createElement('details');
            const summary = document.createElement('summary'); summary.textContent = Array.isArray(v) ? `Array(${v.length})` : 'Object';
            const inner = document.createElement('div'); inner.className = 'nested';
            if (Array.isArray(v)) {
                v.forEach((item, i) => {
                    const sub = document.createElement('details');
                    const su = document.createElement('summary'); su.textContent = `Item ${i}`;
                    const ic = document.createElement('div'); ic.className = 'details-content';
                    if (typeof item === 'object') {
                        renderKV(ic, item);
                    } else { ic.textContent = String(item); }
                    sub.appendChild(su); sub.appendChild(ic); inner.appendChild(sub);
                });
            } else {
                renderKV(inner, v);
            }
            details.appendChild(summary); details.appendChild(inner);
            val.appendChild(details);
        } else {
            val.textContent = String(v);
        }
        row.appendChild(key); row.appendChild(val);
        container.appendChild(row);
    }
}

function buildGamesTable(games) {
    const table = document.createElement('table');
    table.className = 'games-table';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Server</th><th>Count</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const [name, val] of Object.entries(games)) {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td'); tdName.textContent = name;
        const tdVal = document.createElement('td');

        if (val === null) {
            tdVal.textContent = 'null';
        } else if (typeof val === 'number' || typeof val === 'string') {
            tdVal.textContent = String(val);
        } else if (typeof val === 'object') {
            const numericKeys = ['playerCount','player_count','players','count','value','online'];
            let found = null;
            for (const k of numericKeys) { if (k in val) { found = val[k]; break; } }
            if (found !== null) {
                tdVal.textContent = String(found);
            } else {
                const detail = document.createElement('details');
                const s = document.createElement('summary'); s.textContent = 'Details';
                const pre = document.createElement('pre'); pre.textContent = JSON.stringify(val, null, 2);
                detail.appendChild(s); detail.appendChild(pre);
                tdVal.appendChild(detail);
            }
        } else {
            tdVal.textContent = String(val);
        }

        tr.appendChild(tdName); tr.appendChild(tdVal); tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
}

function getCached() {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { localStorage.removeItem(CACHE_KEY); return null; }
}

function formatTime(ts) { return new Date(ts).toLocaleString(); }

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function applyData(data, meta = { source: 'live', ts: Date.now() }) {
    const playerCount = data.playerCount ?? (data.player_count ?? '—');
    const maxPlayerCount = data.maxPlayerCount ?? data.max_player_count ?? '—';
    const maintenance = data.fullMaintenance === true ? 'Full Maintenance' : (data.fullMaintenance === false ? 'Online' : 'Unknown');


    setText('activePlayers', playerCount);
    setText('activePlayersSmall', `Max: ${maxPlayerCount}`);

    setText('networkStatus', maintenance);
    setText('whitelistRank', `Whitelist: ${data.whitelistRank ?? '—'}`);

    if (data.games) {
        const gameKeys = Object.keys(data.games);
        setText('gamesSummary', `${gameKeys.length} mode(s)`);
    } else {
        setText('gamesSummary', '—');
    }

    setText('lastUpdated', formatTime(meta.ts));
    setText('sourceIndicator', `Source: ${meta.source}`);

    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    if (data.games) {
        const table = buildGamesTable(data.games);
        const gamesDetails = document.createElement('details');
        const summary = document.createElement('summary'); summary.textContent = 'Games';
        const inner = document.createElement('div'); inner.className = 'details-content';
        inner.appendChild(table);
        const raw = document.createElement('details');
        const rs = document.createElement('summary'); rs.textContent = 'Raw games data';
        const pre = document.createElement('pre'); pre.textContent = JSON.stringify(data.games, null, 2);
        raw.appendChild(rs); raw.appendChild(pre);
        inner.appendChild(raw);

        gamesDetails.appendChild(summary); gamesDetails.appendChild(inner);
        detailsContainer.appendChild(gamesDetails);
    }

    const mainDetails = document.createElement('details');
    const s = document.createElement('summary'); s.textContent = 'Full network data';
    const c = document.createElement('div'); c.className = 'details-content';
    renderKV(c, data);
    mainDetails.appendChild(s); mainDetails.appendChild(c);
    detailsContainer.appendChild(mainDetails);
}

async function fetchData(force = false) {
    const refreshBtn = document.getElementById('refreshBtn');
    try {
        if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = 'Refreshing...'; }
        const resp = await fetch(apiPath, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        const data = await resp.json();
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now, data }));
        applyData(data, { source: 'live', ts: now });
    } catch (err) {
        console.error('Fetch error:', err);
        const cached = getCached();
        const detailsContainer = document.getElementById('detailsContainer');
        const networkTopInfo = document.getElementsByClassName('network-top-info')[0];
        networkTopInfo.style.display = 'none';
        if (!cached) {
            if (detailsContainer) detailsContainer.innerHTML = `<div class="error">Error loading network status: ${err.message}</div>`;
        } else {
            applyData(cached.data, { source: 'cache', ts: cached.ts });
            const errDiv = document.createElement('div');
            errDiv.className = 'error';
            errDiv.textContent = `Error fetching latest data: ${err.message}`;
            detailsContainer.prepend(errDiv);
        }
    } finally {
        if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.textContent = 'Refresh'; }
    }
}

async function loadStatus() {
    const cached = getCached();
    if (cached) {
        applyData(cached.data, { source: 'cache', ts: cached.ts });
        if (Date.now() - cached.ts > TTL) {
            fetchData();
        }
    } else {
        fetchData();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => fetchData(true));
});
