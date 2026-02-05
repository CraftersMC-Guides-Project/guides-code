export async function onRequest({ params, env }) {
    const { itemId } = params

    const rows = await env.DB.prepare(
        `
        SELECT
        fetched_at,
        buy_price,
        sell_price,
        buy_volume,
        sell_volume,
        avg_7d_price
        FROM bazaar_prices
        WHERE item_id = ?
        ORDER BY fetched_at ASC
        `
    )
    .bind(itemId)
    .all()

    return new Response(JSON.stringify({
        itemId,
        history: rows.results
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60'
        }
    })
}
