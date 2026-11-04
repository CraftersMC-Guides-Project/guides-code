/**
 * Cloudflare Pages Functions Proxy for CraftersMC Leaderboards API
 * Proxies requests to LEADERBOARDS_API_BASE_URL with LEADERBOARDS_API_KEY
 */

const DEFAULT_BASE_URL = "http://135.125.9.81:3993/api/leaderboards";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      "Cache-Control": status === 200 ? "public, max-age=60, s-maxage=120, stale-while-revalidate=300" : "no-store",
      ...extraHeaders
    }
  });
}

function getApiKey(env = {}) {
  return (
    env.LEADERBOARDS_API_KEY ||
    env.leaderboards_api_key ||
    env.LB_API_KEY ||
    env.lb_api_key
  );
}

function getBaseUrl(env = {}) {
  const url =
    env.LEADERBOARDS_API_BASE_URL ||
    env.leaderboards_api_base_url ||
    env.LB_BASE_URL ||
    DEFAULT_BASE_URL;
  return url.replace(/\/+$/, "");
}

/**
 * Normalizes and extracts the sub-path from context.params or URL pathname
 */
function extractSubPath(context) {
  const { request, params } = context;
  const url = new URL(request.url);

  // 1. If path param array is provided by Cloudflare Pages [[path]].js
  if (params && params.path) {
    if (Array.isArray(params.path)) {
      return params.path.filter(Boolean).map(encodeURIComponent).join("/");
    }
    if (typeof params.path === "string") {
      return params.path.replace(/^\/+|\/+$/g, "");
    }
  }

  // 2. If single [id].js param is provided
  if (params && params.id) {
    return encodeURIComponent(params.id);
  }

  // 3. Fallback: Parse from pathname after /api/leaderboards
  const pathname = url.pathname;
  const match = pathname.match(/\/api\/leaderboards(?:\/(.*))?$/);
  if (match && match[1]) {
    return match[1].replace(/^\/+|\/+$/g, "");
  }

  // 4. Query param fallback (?category=skills&item=combat)
  const cat = url.searchParams.get("category") || url.searchParams.get("cat");
  const item = url.searchParams.get("item") || url.searchParams.get("subId");
  const subCat = url.searchParams.get("subCat");

  if (cat && item) {
    if (cat.toLowerCase() === "collections" && subCat) {
      return `collections/${encodeURIComponent(subCat)}/${encodeURIComponent(item)}`;
    }
    return `${encodeURIComponent(cat)}/${encodeURIComponent(item)}`;
  } else if (cat) {
    return encodeURIComponent(cat);
  }

  return "";
}

/**
 * Universal Proxy Handler for all leaderboards requests
 */
export async function handleLeaderboardProxy(context) {
  const { request, env } = context;

  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  const url = new URL(request.url);
  const subPath = extractSubPath(context);
  const baseUrl = getBaseUrl(env);
  const apiKey = getApiKey(env);

  if (!apiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing LEADERBOARDS_API_KEY or LB_API_KEY secret in Cloudflare environment"
      },
      500
    );
  }

  // Construct target upstream URL
  let targetUrl = baseUrl;
  if (subPath) {
    targetUrl += `/${subPath}`;
  }

  // Forward query parameters (limit, page, search, etc.)
  const forwardParams = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "category" && key !== "cat" && key !== "item" && key !== "subId" && key !== "subCat") {
      forwardParams.append(key, value);
    }
  }
  const queryString = forwardParams.toString();
  if (queryString) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const upstreamResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await upstreamResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = {
        ok: false,
        error: "Non-JSON response from leaderboards upstream",
        raw: text.slice(0, 500)
      };
    }

    return jsonResponse(data, upstreamResponse.status);
  } catch (err) {
    const isTimeout = err.name === "AbortError" || err.message?.includes("timeout");
    return jsonResponse(
      {
        ok: false,
        error: isTimeout ? "Leaderboard upstream timed out" : "Leaderboard upstream unreachable",
        detail: err.message,
        targetUrl
      },
      504
    );
  }
}

// Backward-compatible exports
export async function handleLeaderboardIndex(context) {
  return handleLeaderboardProxy(context);
}

export async function handleLeaderboardDetail(context) {
  return handleLeaderboardProxy(context);
}
