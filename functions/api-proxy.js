/**
 * Cloudflare Function - API Proxy for CraftersMC
 * Handles requests to bazaar items, player data, and profile data
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    try {
      const url = new URL(request.url)
      const pathname = url.pathname
      
      // Extract item ID from path (remove leading slash)
      let itemId = pathname.substring(1)
      
      // If empty or root, return instructions
      if (!itemId || itemId === '') {
        return new Response(JSON.stringify({
          message: 'CraftersMC API Proxy',
          endpoints: [
            'GET /:itemId - Get bazaar item details',
            'GET /player/:username - Get player data',
            'GET /profile/:profileId - Get profile data'
          ],
          example: '/wheat'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }

      // Get API key from environment variables
      const apiKey = env.CMC_API_KEY || env.cmc_api_key || env['cmc-api-key'];
      
      if (!apiKey) {
        return new Response(JSON.stringify({ 
          error: 'API key not configured in Cloudflare environment variables. Set CMC_API_KEY in wrangler.toml vars section.' 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }

      // Check if it's a special endpoint
      const pathSegments = itemId.split('/')
      let apiUrl
      
      if (pathSegments[0] === 'player' && pathSegments[1]) {
        // Player endpoint: /player/username
        const username = pathSegments[1]
        apiUrl = `https://api.craftersmc.net/v1/player/${username}`
      } else if (pathSegments[0] === 'profile' && pathSegments[1]) {
        // Profile endpoint: /profile/profileId
        const profileId = pathSegments[1]
        apiUrl = `https://api.craftersmc.net/v1/skyblock/profile/${profileId}`
      } else {
        // Bazaar endpoint: /itemId (legacy support)
        apiUrl = `https://api.craftersmc.net/v1/skyblock/bazaar/${itemId}/details`
      }

      // Call the CraftersMC API
      const response = await fetch(apiUrl, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return new Response(JSON.stringify({ 
          error: `API error: ${response.status} ${response.statusText}` 
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }

      const data = await response.json()
      
      // Return with CORS headers
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=30'
        }
      })
      
    } catch (error) {
      console.error('Proxy error:', error)
      
      return new Response(JSON.stringify({ 
        error: `Internal server error: ${error.message}` 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }
}
