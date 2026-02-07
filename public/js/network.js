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

function flattenGames(games) {
    const rows = [];
    const numericKeys = ['playerCount','player_count','players','count','value','online'];

    function scan(obj, prefix = '') {
        for (const [k, v] of Object.entries(obj)) {
            const currentKey = prefix ? `${prefix}.${k}` : k;
            if (v === null) continue;
            if (typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)))) {
                rows.push({ key: currentKey, label: k, value: Number(v) });
                continue;
            }
            if (typeof v === 'object') {
                let found = null;
                for (const nk of numericKeys) {
                    if (nk in v && (typeof v[nk] === 'number' || (typeof v[nk] === 'string' && !isNaN(Number(v[nk]))))) {
                        found = v[nk]; break;
                    }
                }
                if (found !== null) {
                    rows.push({ key: currentKey, label: k, value: Number(found) });
                } else {
                    scan(v, currentKey);
                }
            }
        }
    }

    scan(games);

    return rows;
}

async function loadExternalLabelMap() {
    try {
        const resp = await fetch('/network-labels.json', { cache: 'no-store' });
        if (!resp.ok) return {};
        return await resp.json();
    } catch (e) {
        return {};
    }
}

function buildGamesTable(games, labelMap = {}) {
    const table = document.createElement('table');
    table.className = 'games-table';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Server</th><th>Count</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const rows = flattenGames(games);

    for (const r of rows) {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.className = 'server-name-cell';
        tdName.textContent = labelMap[r.key] ?? r.label;
        console.log('labelmap', r.key, labelMap[r.key]);

        const tdVal = document.createElement('td'); tdVal.textContent = String(r.value);
        tr.appendChild(tdName); tr.appendChild(tdVal); tbody.appendChild(tr);
    }

    if (rows.length === 0) {
        for (const [name, val] of Object.entries(games)) {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td'); tdName.textContent = name;
            const tdVal = document.createElement('td'); tdVal.textContent = typeof val === 'object' ? JSON.stringify(val) : String(val);
            tr.appendChild(tdName); tr.appendChild(tdVal); tbody.appendChild(tr);
        }
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

async function loadData(data, meta = { source: 'live', ts: Date.now() }) {
    const playerCount = data.playerCount ?? (data.player_count ?? '—');
    const maxPlayerCount = data.maxPlayerCount ?? data.max_player_count ?? '—';
    const maintenance = data.fullMaintenance === true ? 'Full Maintenance' : (data.fullMaintenance === false ? 'Online' : 'Unknown');


    //setText('activePlayers', playerCount);
    document.getElementById('activePlayers').innerHTML = `<div class="glowy-glowy-circle-wooooooo"></div> ${playerCount}`;
    document.getElementById('activePlayersSmall').innerHTML = `Max: ${maxPlayerCount}`;
    document.querySelector(':root').style.setProperty('--online-colour', maintenance === 'Full Maintenance' ? '#dc3545' : '#28a745');

    setText('networkStatus', maintenance);
    setText('whitelistRank', `Whitelist: ${data.whitelistRank ?? '—'}`);

    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    if (data.games) {
        const labelMap = await loadExternalLabelMap();
        const table = buildGamesTable(data.games, labelMap);
        const gamesDetails = document.createElement('details');
        const summary = document.createElement('summary'); summary.textContent = 'Specific player counts';
        const inner = document.createElement('div'); inner.className = 'details-content';
        inner.appendChild(table);
        const hint = document.createElement('div'); hint.className = 'small'; hint.style.margin = '12px'; hint.textContent = 'Player counts for each area';
        inner.appendChild(hint);
        const pre = document.createElement('pre'); pre.textContent = JSON.stringify(data.games, null, 2);

        gamesDetails.appendChild(summary); gamesDetails.appendChild(inner);
        detailsContainer.appendChild(gamesDetails);
    }
}

async function fetchInfo(force = false) {
    const refreshBtn = document.getElementById('refreshBtn');
    try {
        if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = 'Refreshing...'; }
        const resp = await fetch(apiPath, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        const data = await resp.json();
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now, data }));
        await loadData(data, { source: 'live', ts: now });
    } catch (err) {
        console.error('Fetch error:', err);
        const cached = getCached();
        const detailsContainer = document.getElementById('detailsContainer');
        const networkTopInfo = document.getElementsByClassName('network-top-info')[0];
        networkTopInfo.style.display = 'none';
        if (!cached) {
            if (detailsContainer) detailsContainer.innerHTML = `<div class="error">Error loading network status: ${err.message}</div>`;
        } else {
            await loadData(cached.data, { source: 'cache', ts: cached.ts });
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
        await loadData(cached.data, { source: 'cache', ts: cached.ts });
        if (Date.now() - cached.ts > TTL) {
            fetchInfo();
        }
    } else {
        fetchInfo();
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    await loadStatus();
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => fetchInfo(true));
});
