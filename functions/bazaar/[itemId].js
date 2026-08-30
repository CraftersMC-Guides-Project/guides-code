export async function onRequest(context) {
  const { request, env, params } = context;
  try {
    const cmcApiKey = env?.CMC_API_KEY_BAZAAR || env?.CMC_API_KEY || env?.cmc_api_key || null;
    const workerApiKey = env?.CMCG_BAZAAR_KEY || env?.cmcg_bazaar_key || null;
    const itemId = encodeURIComponent(String(params?.itemId || "").trim().toLowerCase());

    if (!itemId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing itemId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Try primary CraftersMC details endpoint
    if (cmcApiKey) {
      try {
        const directRes = await fetch(`https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`, {
          headers: {
            'X-API-Key': cmcApiKey,
            'User-Agent': 'CraftersMC-Guides/1.0'
          }
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          return new Response(JSON.stringify(directData), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=60"
            }
          });
        }
      } catch (e) {}
    }

    // Fallback to bazaar worker proxy
    const upstreamUrl = `https://bazaar.craftersmcguides.workers.dev/${itemId}`;
    const headers = { 'User-Agent': 'CraftersMC-Guides/1.0' };
    if (workerApiKey) headers['X-API-Key'] = workerApiKey;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers
    });

    const resHeaders = new Headers(upstreamResponse.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Cache-Control", "public, max-age=60");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: resHeaders
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
