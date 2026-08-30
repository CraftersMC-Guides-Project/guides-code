export async function onRequest({ request, env }) {
  try {
    const apiKey = env?.CMCG_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing CMCG_API_KEY environment variable in Cloudflare Pages settings" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const headers = {
      'x-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'CraftersMC-Guides/1.0'
    };

    const upstreamRes = await fetch('https://bazaar.craftersmcguides.workers.dev/api/items/history', { headers });

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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=180'
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
