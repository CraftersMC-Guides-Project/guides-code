const REMOTE_BASE_URL = "https://leaderboards.craftersmcguides.workers.dev";

const LEADERBOARD_DEFINITIONS = {
  achievements: {
    name: "Achievements",
    page: "/achievements-leaderboard.html",
    remoteId: "multi",
    property: "achievementsData",
    aliases: ["achievements", "achievement", "achievements-leaderboard"]
  },
  "avg-skill": {
    name: "Average Skill",
    page: "/avg-skill-leaderboard.html",
    remoteId: "multi",
    property: "skillData",
    aliases: ["avg-skill", "average-skill", "average-skill-leaderboard"]
  },
  cakes: {
    name: "Cakes",
    page: "/cakes-leaderboard.html",
    remoteId: "multi",
    property: "cakeData",
    aliases: ["cakes", "cake", "cakes-leaderboard"]
  },
  gems: {
    name: "Gems",
    page: "/gems-leaderboard.html",
    remoteId: "multi",
    property: "gemsData",
    aliases: ["gems", "gems-leaderboard"]
  },
  "crafters-level": {
    name: "Crafters Level",
    page: "/crafters-level-leaderboard.html",
    remoteId: "multi",
    property: "levelsData",
    aliases: ["crafters-level", "levels", "crafters-level-leaderboard"]
  },
  playtime: {
    name: "Playtime",
    page: "/playtime.html",
    remoteId: "multi",
    property: "playtimeData",
    aliases: ["playtime", "playtime-leaderboard"]
  },
  slayers: {
    name: "Slayers",
    page: "/slayers-leaderboards.html",
    remoteId: "multi",
    property: "collectionsData",
    aliases: ["slayers", "slayer", "slayers-leaderboards"]
  },
  damage: {
    name: "Damage",
    page: "/damage-leaderboard.html",
    remoteId: "multi",
    property: "damageData",
    aliases: ["damage", "damage-leaderboard"]
  },
  networth: {
    name: "Networth",
    page: "/networth-leaderboard.html",
    remoteId: "multi",
    property: "networthData",
    aliases: ["networth", "net-worth", "networth-leaderboard"]
  },
  pets: {
    name: "Pets",
    page: "/pets-leaderboards.html",
    remoteId: "multi",
    property: "petsData",
    aliases: ["pets", "pets-leaderboards", "pet-leaderboards"]
  },
  coins: {
    name: "Coins",
    page: "/coins-leaderboards.html",
    remoteId: "multi",
    property: "coinsData",
    aliases: ["coins", "coins-leaderboards", "coins-leaderboard"]
  },
  skills: {
    name: "Skills",
    page: "/skills-leaderboards.html",
    remoteId: "multi",
    property: "skillsLeaderboards",
    aliases: ["skills", "skills-leaderboards", "skill-leaderboards"]
  },
  "target-practice": {
    name: "Target Practice",
    page: "/target-practice-leaderboard.html",
    remoteId: "multi",
    property: "targetPracticeLeaderboard",
    aliases: ["target-practice", "target-practice-leaderboard"]
  },
  "arctic-cave-race": {
    name: "Arctic Cave Race",
    page: "/arctic-cave-race-leaderboard.html",
    remoteId: "multi",
    property: "arcticCaveRace",
    aliases: ["arctic-cave-race", "arctic-race", "arctic-cave-race-leaderboard"]
  },
  "ender-node-hunt": {
    name: "Ender Node Hunt",
    page: "/ender-node-hunt-leaderboard.html",
    remoteId: "multi",
    property: "enderNodeHunt",
    aliases: ["ender-node-hunt", "ender-node-hunt-leaderboard"]
  },
  collections: {
    name: "Collections",
    page: "/collections-leaderboards.html",
    remoteId: "collections",
    property: "collectionsData",
    aliases: ["collections", "collections-leaderboards", "collection-leaderboards"]
  },
  "farming-contests": {
    name: "Farming Contests",
    page: "/farming-contests-leaderboards.html",
    remoteId: "farming-contests",
    property: "collectionsData",
    aliases: ["farming-contests", "farming-contests-leaderboards", "farming-contest-leaderboard"]
  },
  "boss-time": {
    name: "Boss Time",
    page: "/boss-time-leaderboards.html",
    remoteId: "boss-time",
    property: "collectionsData",
    aliases: ["boss-time", "boss-time-leaderboards", "boss-time-leaderboard"]
  }
};

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

function extractRemoteData(remote, definition) {
  const payload = remote && typeof remote === "object" ? remote.data ?? remote.leaderboard ?? remote : remote;
  return definition.property ? payload?.[definition.property] ?? payload : payload;
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
    const items = Array.isArray(remote?.items)
      ? remote.items
      : await buildLeaderboardIndex(request);

    return jsonResponse({
      ok: true,
      source: "remote",
      generatedAt: new Date().toISOString(),
      items
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Failed to load leaderboards index",
      detail: error.message
    }, 502);
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
    const remote = await fetchRemoteJson(
      `/api/leaderboards/${encodeURIComponent(match.definition.remoteId || match.id)}`,
      env
    );
    const leaderboard = extractRemoteData(remote, match.definition);

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
    return jsonResponse({
      ok: false,
      error: "Failed to load leaderboard",
      detail: error.message
    }, 502);
  }
}
