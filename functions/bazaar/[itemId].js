export async function onRequest(context) {
  const { request, env, params } = context;
  try {
    const apiKey = env?.CRAFTERS_API_KEY;
    const itemId = encodeURIComponent(String(params?.itemId || "").trim().toLowerCase());

    if (!itemId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing itemId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing CRAFTERS_API_KEY environment variable in Cloudflare Pages settings" }), {
        status: 500,
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

    // Call live item details endpoint
    let upstreamRes = await fetch(`https://proxy.craftersmcguides.workers.dev/v1/skyblock/bazaar/${itemId}/details`, { headers });
    
    // Direct fallback if proxy fails
    if (!upstreamRes.ok) {
      upstreamRes = await fetch(`https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`, { headers });
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30"
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
