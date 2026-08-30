export async function onRequest({ params, env }) {
    const username = params.username;
    const apiKey = env.CMC_API_KEY;

    const res = await fetch(
        `https://api.craftersmc.net/v1/player/${encodeURIComponent(username)}`,
        {
            headers: {
                'X-API-Key': apiKey,
                'User-Agent': 'CraftersMC-Guides/1.0',
                'Accept': 'application/json'
            }
        }
    );

    return new Response(res.body, {
        status: res.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
