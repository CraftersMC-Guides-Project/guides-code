const ctx = document.getElementById('priceChart').getContext('2d')

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
        plugins: {
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#aaa' }
            },
            y: {
                ticks: { color: '#aaa' }
            }
        }
    }
})

async function loadItem(itemId) {
    const res = await fetch(`/api/history/${itemId}`)
    const data = await res.json()

    const history = data.history
    if (!history || history.length === 0) {
        console.warn('No history for', itemId)
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

document.getElementById('itemSelect').addEventListener('change', e => {
    loadItem(e.target.value)
})

// Initial load
loadItem(document.getElementById('itemSelect').value)
