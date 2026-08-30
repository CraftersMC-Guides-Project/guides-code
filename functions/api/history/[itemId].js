export async function onRequest(context) {
  const { request, env, params } = context;
  try {
    const apiKey = env?.CMCG_BAZAAR_KEY || env?.cmcg_bazaar_key || env?.CMC_API_KEY_BAZAAR || env?.CMC_API_KEY || env?.cmc_api_key || '';
    const itemId = encodeURIComponent(String(params?.itemId || "").trim().toLowerCase());

    if (!itemId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing itemId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'CraftersMC-Guides/1.0'
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
      headers['X-API-Key'] = apiKey;
    }

    // Try primary history endpoint
    let upstreamRes = await fetch(`https://bazaar.craftersmcguides.workers.dev/api/items/${itemId}/history`, { headers });
    if (!upstreamRes.ok && upstreamRes.status === 404) {
      upstreamRes = await fetch(`https://bazaar.craftersmcguides.workers.dev/history/${itemId}`, { headers });
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=120"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}
