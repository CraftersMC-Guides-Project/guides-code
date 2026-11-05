/**
 * Cloudflare Pages Function Proxy for Feather Bot Networth API
 * Proxies to http://135.125.9.81:4994/api/networth?player=...&profile=...
 */
import { dispatchUpstreamRequest } from "./_leaderboards.js";

function corsHeaders(request = null) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, X-Guides-Client",
    "Access-Control-Max-Age": "86400"
  };
}

export async function onRequest(context) {
  const { request, env = {} } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request)
    });
  }

  const url = new URL(request.url);
  const player = url.searchParams.get("player") || url.searchParams.get("username") || "";
  const profile = url.searchParams.get("profile") || "";

  if (!player) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing required 'player' parameter." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(request) }
      }
    );
  }

  const nestApiKey = (
    env.NEST_API_KEY ||
    env.nest_api_key ||
    env["NEST-API-KEY"] ||
    env["nest-api-key"] ||
    env.NestApiKey ||
    ""
  ).trim();

  const clientApiKey = (
    request.headers.get("x-api-key") ||
    request.headers.get("X-API-Key") ||
    url.searchParams.get("apiKey") ||
    ""
  ).trim();

  const apiKeyToUse = nestApiKey || clientApiKey;
  const upstreamHeaders = {
    "Accept": "application/json",
    "User-Agent": "CraftersMC-Guides-Networth/1.0"
  };
  if (apiKeyToUse) {
    upstreamHeaders["x-api-key"] = apiKeyToUse;
  }

  const rawTarget = `http://135.125.9.81:4994/api/networth?player=${encodeURIComponent(player)}${profile ? `&profile=${encodeURIComponent(profile)}` : ""}`;

  try {
    const upstreamResult = await dispatchUpstreamRequest(rawTarget, {
      method: "GET",
      headers: upstreamHeaders,
      timeout: 10000
    });

    return new Response(upstreamResult.text, {
      status: upstreamResult.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders(request),
        "Cache-Control": upstreamResult.status === 200 ? "public, max-age=60, s-maxage=120" : "no-store",
        "X-Proxied-By": "CraftersMC-Pages-Networth"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Upstream Networth API unreachable: " + err.message
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders(request)
        }
      }
    );
  }
}

