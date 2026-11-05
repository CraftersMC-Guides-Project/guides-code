/**
 * Cloudflare Pages Functions Global API Middleware
 * Protects all /api/* endpoints against unauthorized public usage, scraping, and direct browser visits.
 * Requires a valid API key for external consumers, while allowing same-origin requests from the official website.
 */

function isAllowedDomain(urlStr) {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "craftersmc-guides.pages.dev" ||
      host.endsWith(".craftersmc-guides.pages.dev") ||
      host.endsWith(".pages.dev") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch (_) {
    return false;
  }
}

function corsHeaders(request = null, isAllowedOrigin = false) {
  const origin = request ? request.headers.get("origin") : null;
  let allowOrigin = "https://craftersmc-guides.pages.dev";
  if (isAllowedOrigin && origin) {
    allowOrigin = origin;
  } else if (origin && isAllowedDomain(origin)) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, X-Guides-Client, x-cron-key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status = 200, request = null, isAllowedOrigin = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request, isAllowedOrigin),
      "Cache-Control": "no-store"
    }
  });
}

function extractClientApiKey(request, url) {
  // 1. x-api-key header
  const headerKey = request.headers.get("x-api-key") || request.headers.get("X-API-Key");
  if (headerKey) return headerKey.trim();

  // 2. Authorization header: Bearer <key>
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return authHeader.trim();
  }

  // 3. x-cron-key header
  const cronKey = request.headers.get("x-cron-key");
  if (cronKey) return cronKey.trim();

  // 4. Query parameters: ?apiKey=... or ?api_key=... or ?key=... or ?secret=...
  const queryKey =
    url.searchParams.get("apiKey") ||
    url.searchParams.get("api_key") ||
    url.searchParams.get("key") ||
    url.searchParams.get("secret");
  if (queryKey) return queryKey.trim();

  return null;
}

function getValidServerKeys(env = {}) {
  const keys = new Set();
  const candidates = [
    env.LEADERBOARDS_API_KEY,
    env.leaderboards_api_key,
    env.LB_API_KEY,
    env.lb_api_key,
    env.CMC_API_KEY,
    env.cmc_api_key,
    env['cmc-api-key'],
    env.cmcApiKey,
    env.CMCAPIKEY,
    env.CMC_API_KEY_BAZAAR,
    env.CMCG_API_KEY,
    env.cmcg_api_key,
    env.CMCG_BAZAAR_KEY,
    env.cmcg_bazaar_key,
    env.CRON_SECRET,
    env.cron_secret,
    env.NEST_API_KEY,
    env.nest_api_key,
    env['nest-api-key'],
    env['NEST-API-KEY'],
    env.NestApiKey
  ];

  for (const k of candidates) {
    if (typeof k === "string" && k.trim()) {
      keys.add(k.trim());
    }
  }

  // Fallback defaults if env is somehow unpopulated in local dev
  keys.add("edqMKUeDSM7TlfKh");

  return keys;
}

function isInternalWebsiteRequest(request) {
  const secFetchDest = (request.headers.get("sec-fetch-dest") || "").toLowerCase();
  const secFetchMode = (request.headers.get("sec-fetch-mode") || "").toLowerCase();
  const secFetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const clientHeader = (request.headers.get("x-guides-client") || "").toLowerCase();

  // 1. Direct browser URL navigation (typing/clicking the URL directly in address bar)
  // Browsers strictly send sec-fetch-dest: "document" and sec-fetch-mode: "navigate"
  if (secFetchDest === "document" || secFetchMode === "navigate") {
    return false;
  }

  // 2. If origin is present, it MUST match an allowed website domain
  if (origin && !isAllowedDomain(origin)) {
    return false;
  }

  // 3. Must have valid referer from the website or be verified same-origin/same-site
  const hasValidReferer = isAllowedDomain(referer);
  const isSameSite = secFetchSite === "same-origin" || secFetchSite === "same-site";

  // Case A: Legitimate browser fetch originating from the official website
  if (hasValidReferer && (isSameSite || !secFetchSite)) {
    return true;
  }

  // Case B: Explicit internal website header from official app scripts
  if (clientHeader === "craftersmc-web" && (isSameSite || hasValidReferer || (!origin && !referer))) {
    return true;
  }

  return false;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Handle CORS Preflight immediately
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const isAllowedOrigin = isAllowedDomain(origin);
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, isAllowedOrigin)
    });
  }

  // Allow public calendar math info for push service worker background checks
  if (url.pathname.includes("/cron-dispatcher") && url.searchParams.get("info") === "true") {
    return await next();
  }

  // Check client authorization
  const clientKey = extractClientApiKey(request, url);
  const validKeys = getValidServerKeys(env);

  if (clientKey) {
    if (!validKeys.has(clientKey)) {
      return jsonResponse(
        {
          ok: false,
          error: "Unauthorized: Invalid API key."
        },
        401,
        request,
        false
      );
    }
    // Key matches a valid server key -> Proceed to endpoint!
  } else if (!isInternalWebsiteRequest(request)) {
    // No API key and not a verified internal website request -> Block!
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized: API key required. Provide a valid API key via the 'x-api-key' header, Authorization header, or '?apiKey=' query parameter to access this API."
      },
      401,
      request,
      false
    );
  }

  // Execute the target API endpoint handler
  const response = await next();

  // Enforce restricted CORS on response headers so unauthorized sites cannot read it
  const newHeaders = new Headers(response.headers);
  const origin = request.headers.get("origin");
  let allowOrigin = "https://craftersmc-guides.pages.dev";
  if (origin && isAllowedDomain(origin)) {
    allowOrigin = origin;
  } else if (clientKey && origin) {
    allowOrigin = origin;
  }
  newHeaders.set("Access-Control-Allow-Origin", allowOrigin);
  newHeaders.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

