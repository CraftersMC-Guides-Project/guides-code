import { proxyBazaarRequest } from "../_bazaar.js";

export async function onRequest({ request, env }) {
  try {
    return await proxyBazaarRequest(request, env);
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
