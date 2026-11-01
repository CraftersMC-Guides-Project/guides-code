/**
 * Cloudflare Pages Function: Store / Manage FCM registration tokens
 * Automatically repairs D1 database schema and persists subscribers.
 */
import { ensureDbSchema } from '../lib/db.js';

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Auto-migrate / ensure table structure
  if (env.DB) {
    await ensureDbSchema(env.DB);
  }

  if (request.method === 'GET') {
    let subscriberCount = 0;
    let sampleColumns = [];
    if (env.DB) {
      try {
        const countRes = await env.DB.prepare('SELECT COUNT(*) as total FROM fcm_subscribers').first();
        subscriberCount = countRes ? countRes.total : 0;

        const info = await env.DB.prepare("PRAGMA table_info(fcm_subscribers)").all();
        sampleColumns = (info.results || []).map(c => c.name);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      status: 'ready',
      vapid_public_key: env.key_pair_fcm ? 'Configured' : 'Missing in secrets',
      has_database: !!env.DB,
      columns: sampleColumns,
      subscribers: subscriberCount,
      message: 'FCM Token endpoint is operational.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const { token, preferences, subscription } = data;

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const endpoint = subscription?.endpoint || (token ? `https://fcm.googleapis.com/wp/${token}` : null);
      const p256dh = subscription?.keys?.p256dh || null;
      const auth = subscription?.keys?.auth || null;

      // If D1 database is bound, store the token
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO fcm_subscribers (token, endpoint, p256dh, auth, preferences, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(token) DO UPDATE SET
              endpoint = excluded.endpoint,
              p256dh = excluded.p256dh,
              auth = excluded.auth,
              preferences = excluded.preferences,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            token,
            endpoint,
            p256dh,
            auth,
            JSON.stringify(preferences || {})
          ).run();
        } catch (dbErr) {
          console.warn('[fcm-token] DB write error:', dbErr.message);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Token registered successfully',
        has_subscription: !!endpoint
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

  if (request.method === 'DELETE') {
    try {
      const data = await request.json().catch(() => ({}));
      const { token, endpoint } = data;

      if (env.DB && (token || endpoint)) {
        await env.DB.prepare(
          'DELETE FROM fcm_subscribers WHERE token = ? OR endpoint = ?'
        ).bind(token || '', endpoint || '').run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Subscription removed successfully'
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
