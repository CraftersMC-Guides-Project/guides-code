export async function onRequest({ request, env, params }) {
  try {
    console.log('=== HISTORY REQUEST ==');
    console.log('Params:', JSON.stringify(params));
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Available env keys:', Object.keys(env).filter(k => k.includes('API') || k.includes('BAZAAR')));

    const apiKey = env.CMCG_BAZAAR_KEY || env.cmcg_bazaar_key || null;
    console.log('API Key present:', !!apiKey);
    console.log('API Key value (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'null');

    if (!apiKey) {
      console.error('ERROR: Missing CMCG_BAZAAR_KEY secret');
      return new Response(
        JSON.stringify({ ok: false, error: "Missing CMCG_BAZAAR_KEY secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const incomingUrl = new URL(request.url);
    const itemId = encodeURIComponent(String(params.itemId || "").trim().toLowerCase());
    console.log('Item ID:', itemId);
    console.log('Query string:', incomingUrl.search);

    const upstreamUrl = new URL(
      `/history/${itemId}${incomingUrl.search}`,
      "https://bazaar.craftersmcguides.workers.dev"
    );
    console.log('Upstream URL:', upstreamUrl.toString());
    console.log('Headers being sent:', { 'X-API-Key': apiKey.substring(0, 10) + '...' });

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: {
        "X-API-Key": apiKey
      }
    });

    console.log('Upstream response status:', upstreamResponse.status);
    console.log('Upstream response headers:', Object.fromEntries(upstreamResponse.headers.entries()));

    let responseBody = await upstreamResponse.text();
    console.log('Upstream response body (first 500 chars):', responseBody.substring(0, 500));

    const headers = new Headers(upstreamResponse.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", "application/json");

    console.log('=== SENDING RESPONSE ==');
    console.log('Status:', upstreamResponse.status);
    console.log('Response size:', responseBody.length);

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers
    });
  } catch (err) {
    console.error('=== ERROR ==');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message,
        stack: err.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}
