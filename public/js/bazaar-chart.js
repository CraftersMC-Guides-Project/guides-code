const ctx = document.getElementById('priceChart').getContext('2d')
let chart

async function loadItem(itemId) {
    const res = await fetch(`/api/history/${itemId}`)
    const { history } = await res.json()

    const labels = history.map(p =>
    new Date(p.fetched_at).toLocaleString()
    )

    const buyPrices = history.map(p => p.buy_price)
    const sellPrices = history.map(p => p.sell_price)
    const avgPrices = history.map(p => p.avg_7d_price)

    if (chart) chart.destroy()

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Buy Price',
                        data: buyPrices,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        tension: 0.3
                    },
                    {
                        label: 'Sell Price',
                        data: sellPrices,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        tension: 0.3
                    },
                    {
                        label: '7d Avg',
                        data: avgPrices,
                        borderDash: [6, 6],
                        pointRadius: 0,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'nearest',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: (ctx) => {
                                const price = ctx.raw.toFixed(2)
                                return `${ctx.dataset.label}: ${price}`
                            },
                            title: (items) => {
                                return `Time: ${items[0].label}`
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { maxRotation: 45, minRotation: 45 }
                    },
                    y: {
                        ticks: {
                            callback: v => v.toFixed(0)
                        }
                    }
                }
            }
        })
}

// initial load
loadItem('wheat')
