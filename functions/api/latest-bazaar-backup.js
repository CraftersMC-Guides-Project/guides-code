export async function onRequest({ request, env }) {
  try {
    // Fetch latest bazaar data directly from the source API
    const cmcApiKey = env.CMC_API_KEY_BAZAAR;
    if (!cmcApiKey) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Missing CMC_API_KEY_BAZAAR configuration" 
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          }
        }
      );
    }

    // Get all bazaar items
    const itemsRes = await fetch(
      'https://api.craftersmc.net/v1/skyblock/bazaar/items',
      { 
        headers: { 'X-API-Key': cmcApiKey },
        cf: { cacheTtl: 300 }
      }
    );

    if (!itemsRes.ok) {
      throw new Error(`Failed to fetch items: ${itemsRes.status}`);
    }

    const itemsData = await itemsRes.json();
    const itemIds = (
      Array.isArray(itemsData)
        ? itemsData
        : Array.isArray(itemsData.items)
          ? itemsData.items
          : []
    ).filter((id) => typeof id === 'string' && id.length > 0);

    if (itemIds.length === 0) {
      throw new Error('No items returned from bazaar API');
    }

    // Fetch details for all items concurrently (with limited concurrency to avoid throttling)
    const batchSize = 50;
    const backup = {};

    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batch = itemIds.slice(i, i + batchSize);
      const detailsPromises = batch.map((itemId) =>
        fetch(`https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`, {
          headers: { 'X-API-Key': cmcApiKey },
          cf: { cacheTtl: 300 }
        })
          .then((res) => (res.ok ? res.json().then(d => [itemId, d]) : null))
          .catch(() => null)
      );

      const results = await Promise.all(detailsPromises);
      
      for (const result of results) {
        if (result) {
          const [itemId, detail] = result;
          backup[itemId] = {
            buyPrice: detail.buyTopEntries?.[0]?.price ?? null,
            sellPrice: detail.sellTopEntries?.[0]?.price ?? null,
            buyVolume: detail.buyVolume ?? 0,
            sellVolume: detail.sellVolume ?? 0,
            weeklyAveragePrice: detail.weeklyAveragePrice ?? null
          };
        }
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
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (err) {
    console.error('Bazaar backup error:', err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        }
      }
    );
  }
}
API proxy client initialized bazaar:1885:15
Fetching data for: Polished Pumpkin (ID: polished_pumpkin) bazaar:1574:17
Failed to fetch bazaar data for polished_pumpkin: Error: Bazaar item not found in latest snapshot: polished_pumpkin
    getBazaarItem https://craftersmc-guides.pages.dev/js/api-proxy-client.js:123
    promise https://craftersmc-guides.pages.dev/bazaar:1576
    fetchBazaarData https://craftersmc-guides.pages.dev/bazaar:1589
    generateTooltipHTML https://craftersmc-guides.pages.dev/bazaar:1619
    timeout https://craftersmc-guides.pages.dev/bazaar:1805
    setTimeout handler*setupTooltip/< https://craftersmc-guides.pages.dev/bazaar:1800
    setupTooltip https://craftersmc-guides.pages.dev/bazaar:1797
    fillCells https://craftersmc-guides.pages.dev/bazaar:1728
    fillCells https://craftersmc-guides.pages.dev/bazaar:1733
    fillCells https://craftersmc-guides.pages.dev/bazaar:1732
    initializePage https://craftersmc-guides.pages.dev/bazaar:1883
    async* https://craftersmc-guides.pages.dev/bazaar:1918
    EventListener.handleEvent* https://craftersmc-guides.pages.dev/bazaar:1917
api-proxy-client.js:130:15
Failed to fetch polished_pumpkin via Cloudflare Function, using mock data: Bazaar item not found in latest snapshot: polished_pumpkin bazaar:1581:19

