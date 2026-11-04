/**
 * Cloudflare Pages Functions Proxy for Feather Bot API Tester
 * Bypasses browser Mixed Content restrictions when api-tester.html is loaded over HTTPS.
 */

import { dispatchUpstreamRequest } from "./_leaderboards.js";

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

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  let allowOrigin = "https://craftersmc-guides.pages.dev";
  if (origin && isAllowedDomain(origin)) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, X-Guides-Client, X-Target-Url",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function isAllowedTarget(targetUrl) {
  try {
    const u = new URL(targetUrl);
    const host = u.hostname.toLowerCase();

    // Prevent SSRF: block cloud metadata & link-local
    if (host === "169.254.169.254" || host.startsWith("169.254.") || host.includes("metadata")) {
      return false;
    }
    // Block private ranges except localhost/127.0.0.1
    if (host.startsWith("10.") || host.startsWith("192.168.")) {
      return false;
    }
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
      return false;
    }

    // Allow user's dedicated server 135.125.9.81
    if (host === "135.125.9.81") return true;

    // Allow localhost/127.0.0.1 for local dev
    if (host === "localhost" || host === "127.0.0.1") return true;

    // Allow craftersmc domains
    if (host === "craftersmc.net" || host.endsWith(".craftersmc.net") || host.endsWith(".pages.dev")) {
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
}

export async function onRequest(context) {
  const { request, env = {} } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request)
    });
  }

  const url = new URL(request.url);
  let rawTarget =
    url.searchParams.get("target") ||
    url.searchParams.get("url") ||
    request.headers.get("x-target-url");

  if (!rawTarget) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing target parameter. Pass ?target=http://135.125.9.81:4994/api/... or X-Target-Url header."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders(request)
        }
      }
    );
  }

  // Ensure protocol is present
  if (!/^https?:\/\//i.test(rawTarget)) {
    rawTarget = "http://" + rawTarget;
  }

  if (!isAllowedTarget(rawTarget)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Forbidden: Target host is not permitted by API Tester proxy policy."
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders(request)
        }
      }
    );
  }

  let body = null;
  if (request.method === "POST" || request.method === "PUT") {
    try {
      body = await request.text();
    } catch (_) {}
  }

  const upstreamHeaders = {
    "Accept": "application/json",
    "User-Agent": "CraftersMC-Guides-Tester/1.0"
  };

  const contentType = request.headers.get("content-type");
  if (contentType) {
    upstreamHeaders["Content-Type"] = contentType;
  }

  // Retrieve NEST_API_KEY from Cloudflare secrets / environment variables
  const nestApiKey = (
    env.NEST_API_KEY ||
    env.nest_api_key ||
    env["NEST-API-KEY"] ||
    env["nest-api-key"] ||
    env.NestApiKey ||
    ""
  ).trim();

  // Check if client provided a custom key via header or query params
  const clientApiKey = (
    request.headers.get("x-api-key") ||
    request.headers.get("X-API-Key") ||
    url.searchParams.get("apiKey") ||
    url.searchParams.get("api_key") ||
    url.searchParams.get("key") ||
    ""
  ).trim();

  const apiKeyToUse = clientApiKey || nestApiKey;
  if (apiKeyToUse) {
    upstreamHeaders["x-api-key"] = apiKeyToUse;
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader) {
    upstreamHeaders["Authorization"] = authHeader;
  }

  try {
    const upstreamResult = await dispatchUpstreamRequest(rawTarget, {
      method: request.method,
      headers: upstreamHeaders,
      body,
      timeout: 25000
    });

    return new Response(upstreamResult.text, {
      status: upstreamResult.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders(request),
        "Cache-Control": "no-store",
        "X-Proxied-By": "CraftersMC-Pages-Tester-Proxy"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Upstream proxy connection failed: " + err.message
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders(request),
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
