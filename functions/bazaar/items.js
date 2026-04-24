import { proxyBazaarRequest } from "../api/_bazaar.js";

export async function onRequest({ request, env }) {
  return proxyBazaarRequest(request, env, {
    cacheControl: "public, max-age=3600"
  });
}
