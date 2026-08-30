export async function onRequest({ params, env }) {
  const apiKey = env.CMC_API_KEY || env.cmc_api_key || env['cmc-api-key'] || env.CRAFTERS_API_KEY || env.crafters_api_key || env.CMC_KEY || env.API_KEY || env.CMC_API_KEY_BAZAAR || env.CMCG_BAZAAR_KEY || '';

  const res = await fetch(
    `https://api.craftersmc.net/v1/skyblock/profile/${encodeURIComponent(params.profileId)}`,
    {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      }
    }
  );

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
