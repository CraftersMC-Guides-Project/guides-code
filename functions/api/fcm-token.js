/**
 * Cloudflare Pages Function: Store / Manage FCM registration tokens
 * Can persist device tokens to D1 (if available) or return success.
 */
export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      status: 'ready',
      vapid_public_key: env.key_pair_fcm ? 'Configured' : 'Missing in secrets',
      has_database: !!env.DB,
      message: 'FCM Token endpoint is operational.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const { token, preferences } = data;

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If D1 database is bound, store the token
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS fcm_subscribers (
              token TEXT PRIMARY KEY,
              preferences TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          await env.DB.prepare(`
            INSERT INTO fcm_subscribers (token, preferences, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(token) DO UPDATE SET
              preferences = excluded.preferences,
              updated_at = CURRENT_TIMESTAMP
          `).bind(token, JSON.stringify(preferences || {})).run();
        } catch (dbErr) {
          console.warn('[fcm-token] DB write warning:', dbErr.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Token registered successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

