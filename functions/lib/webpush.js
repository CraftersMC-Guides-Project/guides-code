/**
 * Cloudflare Workers / Pages WebPush Dispatcher
 * Signs VAPID JWTs and delivers push notifications to WebPush endpoints.
 */

function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generate VAPID JWT using native Web Crypto API
 */
export async function createVapidJwt(aud, subject, publicKeyB64, privateKeyB64) {
  const rawPub = base64UrlToUint8Array(publicKeyB64);
  const x = bufferToBase64Url(rawPub.slice(1, 33));
  const y = bufferToBase64Url(rawPub.slice(33, 65));

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: privateKeyB64,
    x: x,
    y: y,
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = bufferToBase64Url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = bufferToBase64Url(new TextEncoder().encode(JSON.stringify({
    aud: aud,
    exp: Math.floor(Date.now() / 1000) + (12 * 3600), // 12 hours
    sub: subject || 'mailto:admin@craftersmc.net'
  })));

  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${bufferToBase64Url(signature)}`;
}

/**
 * Send WebPush notification to an endpoint
 */
export async function sendWebPushNotification({ endpoint, vapidPublicKey, vapidPrivateKey, subject }) {
  if (!endpoint) {
    throw new Error('Push subscription endpoint is missing');
  }

  const endpointUrl = new URL(endpoint);
  const aud = `${endpointUrl.protocol}//${endpointUrl.host}`;

  const jwt = await createVapidJwt(aud, subject, vapidPublicKey, vapidPrivateKey);

  const headers = {
    'TTL': '86400',
    'Urgency': 'high',
    'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers
  });

  return {
    status: response.status,
    ok: response.ok,
    statusText: response.statusText
  };
}

