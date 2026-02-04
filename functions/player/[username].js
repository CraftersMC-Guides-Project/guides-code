export async function onRequest({ params, env }) {
    const username = params.username

    const res = await fetch(
        `https://api.craftersmc.net/v1/player/${username}`,
        {
            headers: {
                'X-API-Key': env.CMC_API_KEY
            }
        }
    )

    return new Response(res.body, {
        status: res.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}
