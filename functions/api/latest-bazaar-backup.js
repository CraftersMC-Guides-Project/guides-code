export async function onRequest({ env }) {
  try {
    const result = await env.DB.prepare(
      `
      SELECT
        p.item_id,
        p.fetched_at,
        p.buy_price,
        p.sell_price,
        p.buy_volume,
        p.sell_volume,
        p.avg_7d_price
      FROM bazaar_prices p
      INNER JOIN (
        SELECT item_id, MAX(fetched_at) AS max_fetched_at
        FROM bazaar_prices
        GROUP BY item_id
      ) latest
      ON p.item_id = latest.item_id
      AND p.fetched_at = latest.max_fetched_at
      `
    ).all();

    return new Response(
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        items: result.results || []
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60"
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
