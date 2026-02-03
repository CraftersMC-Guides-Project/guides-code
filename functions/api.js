// Cloudflare Worker - api.js
export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Get API key from header or env
      const apiKey = request.headers.get('X-API-Key') || env.CRAFTERS_API_KEY;
      
      if (!apiKey) {
        return jsonResponse({ error: 'API key required' }, 401, corsHeaders);
      }

      // Route requests
      if (path.startsWith('/api/bazaar/')) {
        const itemId = decodeURIComponent(path.split('/api/bazaar/')[1]);
        return await fetchBazaarItem(itemId, apiKey, corsHeaders);
      }
      
      return jsonResponse({ error: 'Endpoint not found' }, 404, corsHeaders);
      
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  },
};

// Helper function for JSON responses
function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Fetch bazaar item details
async function fetchBazaarItem(itemId, apiKey, corsHeaders) {
  try {
    console.log('Fetching bazaar item:', itemId);
    
    const response = await fetch(
      `https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`,
      {
        headers: {
          'X-API-Key': apiKey,
          'User-Agent': 'CraftersMC-Bazaar/1.0',
        },
      }
    );

    if (!response.ok) {
      return jsonResponse({ 
        error: `API returned ${response.status}: ${response.statusText}`,
        itemId: itemId
      }, response.status, corsHeaders);
    }

    const data = await response.json();
    return jsonResponse(data, 200, corsHeaders);
    
  } catch (error) {
    console.error('Bazaar fetch error:', error);
    return jsonResponse({ 
      error: `Fetch failed: ${error.message}`,
      itemId: itemId
    }, 500, corsHeaders);
  }
}
