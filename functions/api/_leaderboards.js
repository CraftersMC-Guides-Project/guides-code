/**
 * Cloudflare Pages Functions Proxy for CraftersMC Leaderboards API
 * Proxies requests to LEADERBOARDS_API_BASE_URL with LEADERBOARDS_API_KEY
 */

const DEFAULT_BASE_URL = "http://135.125.9.81:3993/api/leaderboards";

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

function corsHeaders(request = null, isAllowed = false) {
  const origin = request ? request.headers.get("origin") : null;
  let allowOrigin = "https://craftersmc-guides.pages.dev";
  if (isAllowed && origin) {
    allowOrigin = origin;
  } else if (origin && isAllowedDomain(origin)) {
    allowOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST, PUT, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, X-Requested-With, X-Guides-Client",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status = 200, extraHeaders = {}, request = null, isAllowed = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request, isAllowed),
      "Cache-Control": status === 200 ? "public, max-age=60, s-maxage=120, stale-while-revalidate=300" : "no-store",
      ...extraHeaders
    }
  });
}

function extractClientApiKey(request, url) {
  const headerKey = request.headers.get("x-api-key") || request.headers.get("X-API-Key");
  if (headerKey) return headerKey.trim();

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return authHeader.trim();
  }

  const queryKey =
    url.searchParams.get("apiKey") ||
    url.searchParams.get("api_key") ||
    url.searchParams.get("key");
  if (queryKey) return queryKey.trim();

  return null;
}

function isInternalWebsiteRequest(request) {
  const secFetchDest = (request.headers.get("sec-fetch-dest") || "").toLowerCase();
  const secFetchMode = (request.headers.get("sec-fetch-mode") || "").toLowerCase();
  const secFetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const clientHeader = (request.headers.get("x-guides-client") || "").toLowerCase();

  // 1. Direct browser URL navigation (typing/clicking the URL in address bar)
  // Browsers strictly send sec-fetch-dest: "document" and sec-fetch-mode: "navigate"
  if (secFetchDest === "document" || secFetchMode === "navigate") {
    return false;
  }

  // 2. If origin is present, it MUST match an allowed website domain
  if (origin && !isAllowedDomain(origin)) {
    return false;
  }

  // 3. Must have the internal client header AND originate from the website
  const hasValidReferer = isAllowedDomain(referer);
  const isSameSite = secFetchSite === "same-origin" || secFetchSite === "same-site";

  if (clientHeader === "craftersmc-web" && isSameSite && hasValidReferer) {
    return true;
  }

  return false;
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

function decodeChunkedBody(headerPart, bodyPart) {
  if (!/transfer-encoding:\s*chunked/i.test(headerPart)) {
    return bodyPart;
  }
  let unchunked = "";
  let pos = 0;
  while (pos < bodyPart.length) {
    const nextCrLf = bodyPart.indexOf("\r\n", pos);
    if (nextCrLf === -1) break;
    const hex = bodyPart.slice(pos, nextCrLf).trim();
    const chunkSize = parseInt(hex, 16);
    if (isNaN(chunkSize) || chunkSize === 0) break;
    unchunked += bodyPart.slice(nextCrLf + 2, nextCrLf + 2 + chunkSize);
    pos = nextCrLf + 2 + chunkSize + 2;
  }
  return unchunked;
}

/**
 * TCP Socket HTTP fetcher for non-standard ports (e.g. 3993) on Cloudflare Workers/Pages
 * Cloudflare's standard fetch() strips non-standard ports, but cloudflare:sockets allows any port.
 */
async function fetchViaSocket(targetUrl, options = {}) {
  const parsed = new URL(targetUrl);
  const hostname = parsed.hostname;
  const port = parseInt(parsed.port || (parsed.protocol === "https:" ? "443" : "80"), 10);
  const path = parsed.pathname + parsed.search;

  // 1. Check for cloudflare:sockets (Cloudflare Pages/Workers environment)
  let connectFn = null;
  try {
    const cs = await import("cloudflare:sockets");
    connectFn = cs.connect;
  } catch (e) {}

  if (connectFn) {
    const socket = connectFn({ hostname, port });
    const timeoutMs = options.timeout || 60000;
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        try { socket.close(); } catch (e) {}
        reject(new Error(`Socket connection to ${hostname}:${port} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const requestPromise = (async () => {
      const writer = socket.writable.getWriter();
      const encoder = new TextEncoder();

      const encodedBody = options.body
        ? (typeof options.body === "string" ? encoder.encode(options.body) : options.body)
        : null;

      const headers = {
        "Host": `${hostname}:${port}`,
        "User-Agent": "CraftersMC-Guides/1.0",
        "Accept": "application/json",
        "Connection": "close",
        ...(options.headers || {})
      };

      if (encodedBody) {
        headers["Content-Length"] = String(encodedBody.length);
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
      }

      let requestStr = `${options.method || "GET"} ${path} HTTP/1.1\r\n`;
      for (const [k, v] of Object.entries(headers)) {
        requestStr += `${k}: ${v}\r\n`;
      }
      requestStr += "\r\n";

      await writer.write(encoder.encode(requestStr));
      if (encodedBody) {
        await writer.write(encodedBody);
      }
      writer.releaseLock();

      const reader = socket.readable.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      reader.releaseLock();

      let totalLen = 0;
      for (const ch of chunks) totalLen += ch.length;
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const ch of chunks) {
        merged.set(ch, offset);
        offset += ch.length;
      }

      const raw = new TextDecoder("utf-8").decode(merged);
      const splitIdx = raw.indexOf("\r\n\r\n");
      if (splitIdx === -1) {
        throw new Error("Invalid socket HTTP response from upstream");
      }

      const headerPart = raw.slice(0, splitIdx);
      let bodyPart = raw.slice(splitIdx + 4);

      const statusMatch = headerPart.match(/^HTTP\/[0-9.]+\s+(\d+)/i);
      const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;

      bodyPart = decodeChunkedBody(headerPart, bodyPart);
      return { status, text: bodyPart };
    })();

    try {
      const result = await Promise.race([requestPromise, timeoutPromise]);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      try { socket.close(); } catch (e) {}
      throw err;
    }
  }

  // 2. Check for node:net (Node.js runtime / local test environment)
  let net = null;
  try {
    net = await import("node:net");
  } catch (e) {}

  if (net && net.createConnection) {
    return new Promise((resolve, reject) => {
      const client = net.createConnection({ host: hostname, port }, () => {
        let req = `${options.method || "GET"} ${path} HTTP/1.1\r\n`;
        let bodyBuf = null;
        if (options.body) {
          bodyBuf = Buffer.isBuffer(options.body) ? options.body : Buffer.from(options.body, "utf-8");
        }
        const headers = {
          "Host": `${hostname}:${port}`,
          "User-Agent": "CraftersMC-Guides/1.0",
          "Accept": "application/json",
          "Connection": "close",
          ...(options.headers || {})
        };
        if (bodyBuf) {
          headers["Content-Length"] = String(bodyBuf.length);
          if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
          }
        }
        for (const [k, v] of Object.entries(headers)) {
          req += `${k}: ${v}\r\n`;
        }
        req += "\r\n";
        client.write(req);
        if (bodyBuf) client.write(bodyBuf);
      });

      let raw = "";
      client.on("data", (chunk) => { raw += chunk.toString("utf-8"); });
      client.on("end", () => {
        client.setTimeout(0);
        const splitIdx = raw.indexOf("\r\n\r\n");
        if (splitIdx === -1) {
          client.destroy();
          return reject(new Error("Invalid HTTP response over socket"));
        }
        const headerPart = raw.slice(0, splitIdx);
        let bodyPart = raw.slice(splitIdx + 4);
        const statusMatch = headerPart.match(/^HTTP\/[0-9.]+\s+(\d+)/i);
        const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;
        bodyPart = decodeChunkedBody(headerPart, bodyPart);
        client.destroy();
        resolve({ status, text: bodyPart });
      });
      client.on("error", (err) => {
        client.setTimeout(0);
        client.destroy();
        reject(err);
      });
      client.setTimeout(options.timeout || 15000, () => {
        client.destroy();
        reject(new Error("TCP connection timed out"));
      });
    });
  }

  throw new Error("No socket provider available for non-standard port");
}

/**
 * Dispatches request using TCP socket on non-standard ports, with fallback to standard fetch()
 */
export async function dispatchUpstreamRequest(targetUrl, options = {}) {
  const parsed = new URL(targetUrl);
  const isNonStandardPort = parsed.port && parsed.port !== "80" && parsed.port !== "443";

  // If non-standard port (like 3993), try raw TCP socket
  if (isNonStandardPort) {
    try {
      return await fetchViaSocket(targetUrl, options);
    } catch (sockErr) {
      // If socket failed, try standard fetch as fallback
    }
  }

  // Standard fetch for port 80/443 or fallback
  const upstreamResponse = await fetch(targetUrl, {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body || undefined,
    signal: options.signal
  });

  const text = await upstreamResponse.text();
  return {
    status: upstreamResponse.status,
    text
  };
}

/**
 * Universal Proxy Handler for all leaderboards requests
 */
export async function handleLeaderboardProxy(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const isAllowedOrigin = isAllowedDomain(origin);
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, isAllowedOrigin)
    });
  }

  const subPath = extractSubPath(context);
  const baseUrl = getBaseUrl(env);
  const serverApiKey = getApiKey(env);

  if (!serverApiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing LEADERBOARDS_API_KEY or LB_API_KEY secret in Cloudflare environment"
      },
      500,
      {},
      request,
      false
    );
  }

  // Client authorization check
  const clientKey = extractClientApiKey(request, url);
  const isInternal = isInternalWebsiteRequest(request);

  if (clientKey) {
    if (clientKey !== serverApiKey) {
      return jsonResponse(
        {
          ok: false,
          error: "Unauthorized: Invalid API key."
        },
        401,
        {},
        request,
        false
      );
    }
  } else if (!isInternal) {
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized: API key required. Provide a valid API key via the 'x-api-key' header, Authorization header, or '?apiKey=' query parameter to access the Leaderboards API."
      },
      401,
      {},
      request,
      false
    );
  }

  // Construct target upstream URL
  let targetUrl = baseUrl;
  if (subPath) {
    targetUrl += `/${subPath}`;
  }

  // Forward query parameters (limit, page, search, etc.)
  // Strip apiKey parameters so they are not leaked in upstream logs
  const forwardParams = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    if (
      key !== "category" &&
      key !== "cat" &&
      key !== "item" &&
      key !== "subId" &&
      key !== "subCat" &&
      key !== "apiKey" &&
      key !== "api_key" &&
      key !== "key"
    ) {
      forwardParams.append(key, value);
    }
  }
  const queryString = forwardParams.toString();
  if (queryString) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
  }

  const method = request.method || "GET";
  let requestBody = null;
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    try {
      requestBody = await request.text();
    } catch (e) {
      requestBody = null;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60500);

    const { status, text } = await dispatchUpstreamRequest(targetUrl, {
      method,
      headers: {
        "Accept": "application/json",
        "x-api-key": serverApiKey,
        ...(requestBody ? { "Content-Type": "application/json" } : {})
      },
      body: requestBody,
      signal: controller.signal,
      timeout: 60000
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = {
        ok: false,
        error: "Non-JSON response from leaderboards upstream",
        raw: text.slice(0, 500),
        targetUrl
      };
    }

    return jsonResponse(data, status, {}, request, true);
  } catch (err) {
    const isTimeout = err.name === "AbortError" || err.message?.includes("timed out");
    return jsonResponse(
      {
        ok: false,
        error: isTimeout ? "Leaderboard upstream timed out" : "Leaderboard upstream unreachable",
        detail: err.message,
        targetUrl
      },
      504,
      {},
      request,
      false
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
