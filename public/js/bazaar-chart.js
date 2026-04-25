const ctx = document.getElementById('priceChart').getContext('2d')
const itemSelect = document.getElementById('itemSelect')
const apiClient = new APIProxyClient(window.location.origin)

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Buy Price',
        borderColor: '#4cc9f0',
        data: [],
        tension: 0.25,
        pointRadius: 3
      },
      {
        label: 'Sell Price',
        borderColor: '#f72585',
        data: [],
        tension: 0.25,
        pointRadius: 3
      },
      {
        label: '7d Avg',
        borderColor: '#fca311',
        borderDash: [5, 5],
        data: [],
        tension: 0.25,
        pointRadius: 3
      }
    ]
  },
  options: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: { ticks: { color: '#aaa' } },
      y: { ticks: { color: '#aaa' } }
    }
  }
})

function prettifyItemId(id) {
  return id
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function loadItems() {
  try {
    const items = await apiClient.getBazaarItems()

    itemSelect.innerHTML = ''

    for (const id of items) {
      const option = document.createElement('option')
      option.value = id
      option.textContent = prettifyItemId(id)
      itemSelect.appendChild(option)
    }

    if (items.length > 0) {
      loadItem(items[0])
    }
  } catch (error) {
    console.error('Failed to load bazaar items:', error)
    itemSelect.innerHTML = '<option value="">Failed to load items</option>'
  }
}

async function loadItem(itemId) {
  try {
    console.log('=== LOADING ITEM ==');
    console.log('Item ID:', itemId);
    console.log('API Base URL:', apiClient.proxyUrl);

    console.log('Calling getBazaarHistory()...');
    const data = await apiClient.getBazaarHistory(itemId);
    console.log('API Response received:', data);
    console.log('Response type:', typeof data);
    console.log('Response keys:', Object.keys(data || {}));

    const history = data.history;
    console.log('History data:', history);
    console.log('History length:', history ? history.length : 'undefined');

    if (!history || history.length === 0) {
      console.warn('No history data available');
      chart.data.labels = []
      chart.data.datasets.forEach(d => (d.data = []))
      chart.update()
      return
    }

    console.log('First history entry:', history[0]);
    console.log('Last history entry:', history[history.length - 1]);

    chart.data.labels = history.map(p => {
      const dateStr = new Date(p.fetched_at).toLocaleTimeString();
      console.log('Converting timestamp:', p.fetched_at, '->', dateStr);
      return dateStr;
    });

    console.log('Buy prices:', history.map(p => p.buy_price));
    console.log('Sell prices:', history.map(p => p.sell_price));
    console.log('Avg 7d prices:', history.map(p => p.avg_7d_price));

    chart.data.datasets[0].data = history.map(p => p.buy_price)
    chart.data.datasets[1].data = history.map(p => p.sell_price)
    chart.data.datasets[2].data = history.map(p => p.avg_7d_price)

    console.log('Chart updated successfully');
    chart.update();
  } catch (error) {
    console.error(`=== ERROR LOADING HISTORY FOR ${itemId} ===`);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);

    chart.data.labels = []
    chart.data.datasets.forEach(d => (d.data = []))
    chart.update()
  }
}

itemSelect.addEventListener('change', e => {
  loadItem(e.target.value)
})

// Init
loadItems()
