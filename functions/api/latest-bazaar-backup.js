export async function onRequest({ request, env }) {
  try {
    // Validate API key
    const apiKey = env.CMCG_BAZAAR_KEY || env.cmcg_bazaar_key || null;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing CMCG_BAZAAR_KEY secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const incomingUrl = new URL(request.url);

    // Fetch latest bazaar data from the source API
    try {
      const cmcApiKey = env.CMC_API_KEY_BAZAAR;
      if (!cmcApiKey) {
        throw new Error("Missing CMC_API_KEY_BAZAAR");
      }

      // Get all bazaar items
      const itemsRes = await fetch(
        'https://api.craftersmc.net/v1/skyblock/bazaar/items',
        { headers: { 'X-API-Key': cmcApiKey } }
      );

      if (!itemsRes.ok) {
        throw new Error(`Failed to fetch items: ${itemsRes.status}`);
      }

      const itemsPayload = await itemsRes.json();
      const itemIds = (
        Array.isArray(itemsPayload)
          ? itemsPayload
          : Array.isArray(itemsPayload.items)
            ? itemsPayload.items
            : []
      ).filter((id) => typeof id === 'string' && id.length > 0);

      // Fetch details for all items in parallel
      const detailsPromises = itemIds.map((itemId) =>
        fetch(`https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`, {
          headers: { 'X-API-Key': cmcApiKey }
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );

      const details = await Promise.all(detailsPromises);

      // Build backup object
      const backup = {};
      for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i];
        const detail = details[i];
        if (detail) {
          backup[itemId] = {
            buyPrice: detail.buyTopEntries?.[0]?.price ?? null,
            sellPrice: detail.sellTopEntries?.[0]?.price ?? null,
            buyVolume: detail.buyVolume ?? 0,
            sellVolume: detail.sellVolume ?? 0,
            weeklyAveragePrice: detail.weeklyAveragePrice ?? null
          };
        }
      }

      return new Response(
        JSON.stringify({
          ok: true,
          timestamp: Date.now(),
          data: backup
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=120"
          }
        }
      );
    } catch (apiErr) {
      console.error('API fetch error:', apiErr);
      // Fallback to upstream proxy if direct API fails
      const upstreamUrl = new URL(
        `/latest-bazaar-backup${incomingUrl.search}`,
        "https://bazaar.craftersmcguides.workers.dev"
      );

      const upstreamResponse = await fetch(upstreamUrl.toString(), {
        method: request.method,
        headers: {
          "X-API-Key": apiKey
        }
      });

      const headers = new Headers(upstreamResponse.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=60");

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers
      });
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}
