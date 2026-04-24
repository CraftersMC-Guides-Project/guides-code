const REMOTE_BASE_URL = "http://bazaar.craftersmcguides.workers.dev";

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...headers
    }
  });
}

function getBazaarApiKey(env = {}) {
  return env.CMCG_BAZAAR_KEY || env.cmcg_bazaar_key || null;
}

export async function proxyBazaarRequest(request, env, { cacheControl } = {}) {
  const apiKey = getBazaarApiKey(env);
  if (!apiKey) {
    return jsonResponse(
      { ok: false, error: "Missing CMCG_BAZAAR_KEY secret" },
      500
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, REMOTE_BASE_URL);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: {
        "X-API-Key": apiKey
      }
    });
  } catch (error) {
    return jsonResponse(
      { ok: false, error: "Failed to reach Bazaar upstream", detail: error.message },
      502
    );
  }

  const headers = new Headers(upstreamResponse.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  if (cacheControl) headers.set("Cache-Control", cacheControl);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers
  });
}
