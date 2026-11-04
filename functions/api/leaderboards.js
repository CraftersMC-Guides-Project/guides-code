import { handleLeaderboardProxy } from "./_leaderboards.js";

export async function onRequest(context) {
  return handleLeaderboardProxy(context);
}
