const REMOTE_BASE_URL = "https://leaderboards.craftersmcguides.workers.dev";

const LEADERBOARD_DEFINITIONS = {
  achievements: {
    name: "Achievements",
    page: "/achievements-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "achievementsData",
    aliases: ["achievements", "achievement", "achievements-leaderboard"]
  },
  "avg-skill": {
    name: "Average Skill",
    page: "/avg-skill-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "skillData",
    aliases: ["avg-skill", "average-skill", "average-skill-leaderboard"]
  },
  cakes: {
    name: "Cakes",
    page: "/cakes-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "cakeData",
    aliases: ["cakes", "cake", "cakes-leaderboard"]
  },
  gems: {
    name: "Gems",
    page: "/gems-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "gemsData",
    aliases: ["gems", "gems-leaderboard"]
  },
  "crafters-level": {
    name: "Crafters Level",
    page: "/crafters-level-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "levelsData",
    aliases: ["crafters-level", "levels", "crafters-level-leaderboard"]
  },
  playtime: {
    name: "Playtime",
    page: "/playtime.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "playtimeData",
    aliases: ["playtime", "playtime-leaderboard"]
  },
  slayers: {
    name: "Slayers",
    page: "/slayers-leaderboards.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "collectionsData",
    aliases: ["slayers", "slayer", "slayers-leaderboards"]
  },
  damage: {
    name: "Damage",
    page: "/damage-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "damageData",
    aliases: ["damage", "damage-leaderboard"]
  },
  networth: {
    name: "Networth",
    page: "/networth-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "networthData",
    aliases: ["networth", "net-worth", "networth-leaderboard"]
  },
  pets: {
    name: "Pets",
    page: "/pets-leaderboards.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "petsData",
    aliases: ["pets", "pets-leaderboards", "pet-leaderboards"]
  },
  coins: {
    name: "Coins",
    page: "/coins-leaderboards.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "coinsData",
    aliases: ["coins", "coins-leaderboards", "coins-leaderboard"]
  },
  skills: {
    name: "Skills",
    page: "/skills-leaderboards.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "skillsLeaderboards",
    aliases: ["skills", "skills-leaderboards", "skill-leaderboards"]
  },
  "target-practice": {
    name: "Target Practice",
    page: "/target-practice-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "targetPracticeLeaderboard",
    aliases: ["target-practice", "target-practice-leaderboard"]
  },
  "arctic-cave-race": {
    name: "Arctic Cave Race",
    page: "/arctic-cave-race-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "arcticCaveRace",
    aliases: ["arctic-cave-race", "arctic-race", "arctic-cave-race-leaderboard"]
  },
  "ender-node-hunt": {
    name: "Ender Node Hunt",
    page: "/ender-node-hunt-leaderboard.html",
    remoteId: "multi",
    sourcePath: "/js/multi-lb-data.js",
    property: "enderNodeHunt",
    aliases: ["ender-node-hunt", "ender-node-hunt-leaderboard"]
  },
  collections: {
    name: "Collections",
    page: "/collections-leaderboards.html",
    remoteId: "collections",
    sourcePath: "/js/updated_collections.js",
    property: "collectionsData",
    aliases: ["collections", "collections-leaderboards", "collection-leaderboards"]
  },
  "farming-contests": {
    name: "Farming Contests",
    page: "/farming-contests-leaderboards.html",
    remoteId: "farming-contests",
    sourcePath: "/js/farming-contest-leaderboard.js",
    property: "collectionsData",
    aliases: ["farming-contests", "farming-contests-leaderboards", "farming-contest-leaderboard"]
  },
  "boss-time": {
    name: "Boss Time",
    page: "/boss-time-leaderboards.html",
    remoteId: "boss-time",
    sourcePath: "/js/boss-time-leaderboard.js",
    property: "collectionsData",
    aliases: ["boss-time", "boss-time-leaderboards", "boss-time-leaderboard"]
  }
};

const SOURCE_CACHE = new Map();

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    }
  });
}

function getApiKey(env = {}) {
  return env.LB_API_KEY || env.lb_api_key || env["lb-api-key"] || null;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getDefinition(id) {
  const requestedId = String(id || "").trim();
  if (!requestedId) return null;

  const directMatch = LEADERBOARD_DEFINITIONS[requestedId];
  if (directMatch) return { id: requestedId, definition: directMatch };

  const normalized = requestedId.toLowerCase();
  for (const [leaderboardId, definition] of Object.entries(LEADERBOARD_DEFINITIONS)) {
    if ((definition.aliases || []).includes(normalized)) {
      return { id: leaderboardId, definition };
    }
  }

  return null;
}

async function fetchRemoteJson(path, env) {
  const apiKey = getApiKey(env);
  if (!apiKey) {
    throw new Error("Missing LB_API_KEY secret");
  }

  const response = await fetch(`${REMOTE_BASE_URL}${path}`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (error) {
    json = { ok: false, error: "Invalid JSON from upstream", detail: text };
  }

  if (!response.ok) {
    const detail = json && typeof json === "object" ? json.error || json.detail : text;
    throw new Error(`Remote request failed (${response.status}): ${detail || response.statusText}`);
  }

  return json;
}

async function loadSourceData(origin, sourcePath) {
  if (SOURCE_CACHE.has(sourcePath)) {
    return SOURCE_CACHE.get(sourcePath);
  }

  const response = await fetch(`${origin}${sourcePath}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourcePath}: ${response.status}`);
  }

  const jsText = await response.text();
  const parsed = extractData(jsText);
  SOURCE_CACHE.set(sourcePath, parsed);
  return parsed;
}

function extractData(jsText) {
  const cleaned = jsText
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();

  const declarations = cleaned
    .replace(/const\s+([A-Za-z0-9_]+)\s*=\s*/g, "\"$1\": ")
    .replace(/;\s*(?=\n|$)/g, ",");

  const jsonLike = `{${declarations}}`
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/([{|,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  return JSON.parse(jsonLike);
}

async function getLocalLeaderboard(id, request) {
  const match = getDefinition(id);
  if (!match) {
    throw new Error(`Unknown leaderboard: ${id}`);
  }

  const origin = new URL(request.url).origin;
  const sourceData = await loadSourceData(origin, match.definition.sourcePath);
  const leaderboard = sourceData[match.definition.property];

  if (typeof leaderboard === "undefined") {
    throw new Error(`Missing property ${match.definition.property} in ${match.definition.sourcePath}`);
  }

  return {
    id: match.id,
    name: match.definition.name,
    page: match.definition.page,
    leaderboard
  };
}

function extractRemoteData(remote, definition) {
  const payload = remote && typeof remote === "object" ? remote.data ?? remote.leaderboard ?? remote : remote;
  return definition.property ? payload?.[definition.property] ?? payload : payload;
}

function mergeLeaderboardData(localData, remoteData) {
  if (Array.isArray(localData) && Array.isArray(remoteData)) {
    return localData.map((localItem, index) =>
      mergeLeaderboardData(localItem, remoteData[index] ?? {})
    );
  }

  if (isPlainObject(localData) && isPlainObject(remoteData)) {
    const merged = { ...localData };

    for (const [key, localValue] of Object.entries(localData)) {
      if (key in remoteData) {
        merged[key] = mergeLeaderboardData(localValue, remoteData[key]);
      }
    }

    for (const [key, remoteValue] of Object.entries(remoteData)) {
      if (!(key in merged)) {
        merged[key] = remoteValue;
      }
    }

    return merged;
  }

  return remoteData ?? localData;
}

export async function buildLeaderboardIndex(request) {
  const origin = new URL(request.url).origin;

  return Object.entries(LEADERBOARD_DEFINITIONS).map(([id, definition]) => ({
    id,
    name: definition.name,
    page: `${origin}${definition.page}`
  }));
}

export async function handleLeaderboardIndex({ request, env }) {
  try {
    const remote = await fetchRemoteJson("/api/leaderboards", env);
    return jsonResponse({
      ok: true,
      source: "remote",
      generatedAt: new Date().toISOString(),
      items: Array.isArray(remote) ? remote : remote.items || remote.leaderboards || remote.data || remote
    });
  } catch (error) {
    const items = await buildLeaderboardIndex(request);
    return jsonResponse({
      ok: true,
      source: "local",
      generatedAt: new Date().toISOString(),
      items,
      fallbackReason: error.message
    });
  }
}

export async function handleLeaderboardDetail({ request, env, params }) {
  const requestedId = params.id;
  const match = getDefinition(requestedId);

  if (!match) {
    return jsonResponse({
      ok: false,
      error: `Unknown leaderboard id: ${requestedId}`
    }, 404);
  }

  try {
    const local = await getLocalLeaderboard(match.id, request);
    const remote = await fetchRemoteJson(
      `/api/leaderboards/${encodeURIComponent(match.definition.remoteId || match.id)}`,
      env
    );
    const remoteData = extractRemoteData(remote, match.definition);
    const leaderboard = mergeLeaderboardData(local.leaderboard, remoteData);

    return jsonResponse({
      ok: true,
      id: match.id,
      name: match.definition.name,
      page: match.definition.page,
      source: "remote",
      generatedAt: new Date().toISOString(),
      leaderboard
    });
  } catch (error) {
    try {
      const local = await getLocalLeaderboard(match.id, request);
      return jsonResponse({
        ok: true,
        ...local,
        source: "local",
        generatedAt: new Date().toISOString(),
        fallbackReason: error.message
      });
    } catch (localError) {
      return jsonResponse({
        ok: false,
        error: "Failed to load leaderboard",
        detail: localError.message
      }, 502);
    }
  }
}
