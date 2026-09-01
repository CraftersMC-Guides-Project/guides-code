export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
      },
    });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = env.cmc_api_key || env.CMC_API_KEY || env['cmc-api-key'] || env.cmcApiKey || env.CMCAPIKEY;
  const upstreamUrl = 'https://api.craftersmc.net/v1/network/voters';

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Cloudflare-Pages-Proxy'
  };

  if (token) {
    headers['x-api-key'] = token;
  }

  try {
    const response = await fetch(upstreamUrl, { method: 'GET', headers });
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
