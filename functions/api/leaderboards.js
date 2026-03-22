export async function onRequest({ request }) {
  const origin = new URL(request.url).origin;
  const sources = {
    multi: "/js/multi-lb-data.js",
    boss: "/js/boss-time-leaderboard.js",
    farming: "/js/farming-contest-leaderboard.js",
    collections: "/js/updated_collections.js",
  };

  try {
    const entries = await Promise.all(
      Object.entries(sources).map(async ([key, path]) => {
        const res = await fetch(origin + path);
        if (!res.ok) throw new Error("Failed to fetch " + path + ": " + res.status);
        const jsText = await res.text();
        return [key, extractData(jsText)];
      })
    );

    const payload = Object.fromEntries(entries);

    return new Response(
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        leaderboards: payload,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("leaderboards endpoint error", error);
    return new Response(
      JSON.stringify({
        error: "Failed to collect leaderboards",
        detail: error.message,
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

function extractData(jsText) {
  // Parse the static data-only JS files into JSON without using eval/new Function
  const cleaned = jsText
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/\/\/.*$/gm, "") // line comments
    .trim();

  const declarations = cleaned
    .replace(/const\s+([A-Za-z0-9_]+)\s*=\s*/g, '"$1": ')
    .replace(/;\s*(?=\n|$)/g, ",");

  let jsonLike = `{${declarations}}`
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/([{|,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');

  try {
    return JSON.parse(jsonLike);
  } catch (err) {
    throw new Error("Could not parse data file: " + err.message);
  }
}
