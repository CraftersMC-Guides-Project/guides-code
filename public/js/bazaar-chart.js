const ctx = document.getElementById('priceChart').getContext('2d')
const itemSelect = document.getElementById('itemSelect')

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
  const res = await fetch(
    'https://craftersmc-guides.pages.dev/bazaar/items'
  )
  const data = await res.json()

  const items = data.values.sort()

  itemSelect.innerHTML = ''

  for (const id of items) {
    const option = document.createElement('option')
    option.value = id
    option.textContent = prettifyItemId(id)
    itemSelect.appendChild(option)
  }

  // Load first item automatically
  if (items.length > 0) {
    loadItem(items[0])
  }
}

async function loadItem(itemId) {
  const res = await fetch(`/api/history/${itemId}`)
  const data = await res.json()

  const history = data.history
  if (!history || history.length === 0) {
    chart.data.labels = []
    chart.data.datasets.forEach(d => (d.data = []))
    chart.update()
    return
  }

  chart.data.labels = history.map(p =>
    new Date(p.fetched_at).toLocaleTimeString()
  )

  chart.data.datasets[0].data = history.map(p => p.buy_price)
  chart.data.datasets[1].data = history.map(p => p.sell_price)
  chart.data.datasets[2].data = history.map(p => p.avg_7d_price)

  chart.update()
}

itemSelect.addEventListener('change', e => {
  loadItem(e.target.value)
})

// Init
loadItems()
