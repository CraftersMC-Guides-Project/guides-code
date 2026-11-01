/**
 * Dedicated single-device push notification tester
 * Dispatches test alerts ONLY to the requesting client's endpoint.
 * Completely isolated from the subscribers database to prevent broadcast spam.
 */

import { sendWebPushNotification } from '../lib/webpush.js';

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const data = await request.json().catch(() => ({}));
    const { token, endpoint } = data;

    const targetEndpoint = endpoint || (token ? `https://fcm.googleapis.com/wp/${token}` : null);
    if (!targetEndpoint) {
      return new Response(JSON.stringify({ error: 'Endpoint or token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const pubKey = env.key_pair_fcm;
    const privKey = env.private_key_fcm;
    if (!pubKey || !privKey) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cleanPubKey = pubKey.replace(/["']/g, '').trim();
    const cleanPrivKey = privKey.replace(/["']/g, '').trim();

    const sendRes = await sendWebPushNotification({
      endpoint: targetEndpoint,
      vapidPublicKey: cleanPubKey,
      vapidPrivateKey: cleanPrivKey,
      subject: 'mailto:alerts@craftersmc-guides.pages.dev'
    });

    return new Response(JSON.stringify({
      success: sendRes.ok,
      status: sendRes.status,
      message: sendRes.ok
        ? 'Test alert sent successfully to your device'
        : `Push server responded with HTTP ${sendRes.status}`,
      endpoint: targetEndpoint.slice(-15)
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

