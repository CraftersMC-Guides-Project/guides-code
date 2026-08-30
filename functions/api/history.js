export async function onRequest({ request, env }) {
  try {
    const apiKey = env?.CMCG_API_KEY || env?.CMCG_BAZAAR_KEY || env?.CMC_API_KEY || null;
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "Missing CMCG_API_KEY environment variable in Cloudflare Pages settings" }), {
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

    const upstreamRes = await fetch('https://bazaar.craftersmcguides.workers.dev/api/items/history', { headers });

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
