export async function onRequest({ request, env }) {
  try {
    const apiKey = env?.CMC_API_KEY || env?.CRAFTERS_API_KEY || env?.CMC_API_KEY_BAZAAR;
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing CMC_API_KEY environment variable in Cloudflare Pages settings" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const headers = {
      'X-API-Key': apiKey,
      'x-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'CraftersMC-Guides/1.0'
    };

    // Primary: Direct CraftersMC API
    let upstreamRes = await fetch('https://api.craftersmc.net/v1/skyblock/bazaar/items', { headers });

    // Fallback: Proxy worker if direct API fails
    if (!upstreamRes.ok) {
      upstreamRes = await fetch('https://proxy.craftersmcguides.workers.dev/v1/skyblock/bazaar/items', { headers });
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
