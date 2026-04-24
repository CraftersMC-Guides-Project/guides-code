export async function onRequest({ request, env }) {
  try {
    const apiKey = env.CMCG_BAZAAR_KEY || env.cmcg_bazaar_key || null;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing CMCG_BAZAAR_KEY secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(
      `/items${incomingUrl.search}`,
      "https://bazaar.craftersmcguides.workers.dev"
    );

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: {
        "X-API-Key": apiKey
      }
    });

    const headers = new Headers(upstreamResponse.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}
