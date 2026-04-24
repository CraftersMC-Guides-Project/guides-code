import { proxyBazaarRequest } from "./_bazaar.js";

export async function onRequest({ request, env }) {
  try {
    return await proxyBazaarRequest(request, env, {
      cacheControl: "public, max-age=60"
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
}
