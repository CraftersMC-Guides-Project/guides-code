/* Fetch and render network status */

const apiPath = '/network-status';

function createBento(label, value, small) {
    const div = document.createElement('div');
    div.className = 'bento';
    div.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>${small ? `<div class="small">${small}</div>` : ''}`;
    return div;
}

function renderKV(container, obj) {
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

async function loadStatus() {
    const bentoGrid = document.getElementById('bentoGrid');
    const detailsContainer = document.getElementById('detailsContainer');
    bentoGrid.innerHTML = '';
    detailsContainer.innerHTML = '';

    try {
        const resp = await fetch(apiPath, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        const data = await resp.json();

        // Important info first
        const playerCount = data.playerCount ?? (data.player_count ?? '—');
        const maxPlayerCount = data.maxPlayerCount ?? data.max_player_count ?? '—';
        const maintenance = data.fullMaintenance === true ? 'Full Maintenance' : (data.fullMaintenance === false ? 'Online' : 'Unknown');

        bentoGrid.appendChild(createBento('Active players', playerCount, `Max: ${maxPlayerCount}`));
        bentoGrid.appendChild(createBento('Status', maintenance, `Whitelist Rank: ${data.whitelistRank ?? '—'}`));

        // Games listing if exists
        if (data.games) {
            const gamesList = Object.entries(data.games).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
            bentoGrid.appendChild(createBento('Games summary', '', 'See details below'));

            const gamesDetails = document.createElement('details');
            const summary = document.createElement('summary'); summary.textContent = 'Games';
            const inner = document.createElement('div'); inner.className = 'details-content';
            renderKV(inner, data.games);
            gamesDetails.appendChild(summary); gamesDetails.appendChild(inner);
            detailsContainer.appendChild(gamesDetails);
        }

        // planned maintenance & other fields
        const mainDetails = document.createElement('details');
        const s = document.createElement('summary'); s.textContent = 'Full network data';
        const c = document.createElement('div'); c.className = 'details-content';
        renderKV(c, data);
        mainDetails.appendChild(s); mainDetails.appendChild(c);
        detailsContainer.appendChild(mainDetails);

    } catch (err) {
        detailsContainer.innerHTML = `<div class="error">Error loading network status: ${err.message}</div>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    document.getElementById('refreshBtn').addEventListener('click', () => loadStatus());
});
