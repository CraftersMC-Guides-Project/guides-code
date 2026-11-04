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

      const headers = {
        "Host": `${hostname}:${port}`,
        "User-Agent": "CraftersMC-Guides/1.0",
        "Accept": "application/json",
        "Connection": "close",
        ...(options.headers || {})
      };

      let requestStr = `${options.method || "GET"} ${path} HTTP/1.1\r\n`;
      for (const [k, v] of Object.entries(headers)) {
        requestStr += `${k}: ${v}\r\n`;
      }
      requestStr += "\r\n";

      await writer.write(encoder.encode(requestStr));
      if (options.body) {
        if (typeof options.body === "string") {
          await writer.write(encoder.encode(options.body));
        } else {
          await writer.write(options.body);
        }
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

      if (/transfer-encoding:\s*chunked/i.test(headerPart)) {
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
        bodyPart = unchunked;
      }

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
        const headers = {
          "Host": `${hostname}:${port}`,
          "User-Agent": "CraftersMC-Guides/1.0",
          "Accept": "application/json",
          "Connection": "close",
          ...(options.headers || {})
        };
        for (const [k, v] of Object.entries(headers)) {
          req += `${k}: ${v}\r\n`;
        }
        req += "\r\n";
        client.write(req);
        if (options.body) client.write(options.body);
      });

      let raw = "";
      client.on("data", (chunk) => { raw += chunk.toString("utf-8"); });
      client.on("end", () => {
        const splitIdx = raw.indexOf("\r\n\r\n");
        if (splitIdx === -1) return reject(new Error("Invalid HTTP response over socket"));
        const headerPart = raw.slice(0, splitIdx);
        let bodyPart = raw.slice(splitIdx + 4);
        const statusMatch = headerPart.match(/^HTTP\/[0-9.]+\s+(\d+)/i);
        const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;
        resolve({ status, text: bodyPart });
      });
      client.on("error", reject);
      client.setTimeout(options.timeout || 60000, () => {
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
async function dispatchUpstreamRequest(targetUrl, options = {}) {
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
    const timeoutId = setTimeout(() => controller.abort(), 60500);

    const { status, text } = await dispatchUpstreamRequest(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey
      },
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

    return jsonResponse(data, status);
  } catch (err) {
    const isTimeout = err.name === "AbortError" || err.message?.includes("timed out");
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
