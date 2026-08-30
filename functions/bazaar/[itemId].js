export async function onRequest(context) {
  const { request, env, params } = context;
  try {
    const apiKey = env?.CMC_API_KEY || env?.CRAFTERS_API_KEY || env?.CMC_API_KEY_BAZAAR;
    const itemId = encodeURIComponent(String(params?.itemId || "").trim().toLowerCase());

    if (!itemId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing itemId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

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
    let upstreamRes = await fetch(`https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`, { headers });

    // Fallback: Proxy worker if direct API fails
    if (!upstreamRes.ok) {
      upstreamRes = await fetch(`https://proxy.craftersmcguides.workers.dev/v1/skyblock/bazaar/${itemId}/details`, { headers });
    }

    if (!upstreamRes.ok) {
      let errBody = null;
      try { errBody = await upstreamRes.json(); } catch (e) { errBody = await upstreamRes.text(); }
      return new Response(JSON.stringify({
        ok: false,
        status: upstreamRes.status,
        upstream_error: errBody,
        debug_used_key: apiKey || "UNDEFINED",
        debug_available_env_keys: Object.keys(env || {})
      }), {
        status: upstreamRes.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
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
