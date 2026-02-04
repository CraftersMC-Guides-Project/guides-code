export async function onRequest() {
  return new Response(JSON.stringify({
    message: 'CraftersMC API Proxy',
    endpoints: [
      'GET /bazaar/:itemId',
      'GET /player/:username',
      'GET /profile/:profileId'
    ]
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
