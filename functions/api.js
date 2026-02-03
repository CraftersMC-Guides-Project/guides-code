// Cloudflare Worker - api.js
export default {
  async fetch(request, env) {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const apiKey = request.headers.get('X-API-Key') || env.CRAFTERS_API_KEY;

    // Route requests
    if (url.pathname.startsWith('/api/bazaar/')) {
      const itemId = url.pathname.split('/api/bazaar/')[1];
      return handleBazaarRequest(itemId, apiKey);
    }

    if (url.pathname === '/api/bazaar-items') {
      return handleBazaarItemsRequest(apiKey);
    }

    if (url.pathname.startsWith('/api/player/')) {
      const username = url.pathname.split('/api/player/')[1];
      return handlePlayerRequest(username, apiKey);
    }

    if (url.pathname.startsWith('/api/skyblock/profile/')) {
      const profileId = url.pathname.split('/api/skyblock/profile/')[1];
      return handleSkyblockProfileRequest(profileId, apiKey);
    }

    if (url.pathname === '/api/network/status') {
      return handleNetworkStatusRequest(apiKey);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};

async function handleBazaarRequest(itemId, apiKey) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      `https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function handleBazaarItemsRequest(apiKey) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      'https://api.craftersmc.net/v1/skyblock/bazaar/items',
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function handlePlayerRequest(username, apiKey) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      `https://api.craftersmc.net/v1/player/${username}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function handleSkyblockProfileRequest(profileId, apiKey) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      `https://api.craftersmc.net/v1/skyblock/profile/${profileId}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function handleNetworkStatusRequest(apiKey) {
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      'https://api.craftersmc.net/v1/network/status',
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Max-Age': '86400',
};
