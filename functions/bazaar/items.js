export async function onRequest({ request, env }) {
  try {
    const apiKey = env?.CRAFTERS_API_KEY || env?.CMC_API_KEY || env?.CMC_API_KEY_BAZAAR || null;
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

    let upstreamRes = await fetch('https://proxy.craftersmcguides.workers.dev/v1/skyblock/bazaar/items', { headers });
    if (!upstreamRes.ok) {
      upstreamRes = await fetch('https://api.craftersmc.net/v1/skyblock/bazaar/items', { headers });
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
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
