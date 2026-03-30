import { handleLeaderboardIndex } from "./_leaderboards.js";

export async function onRequest(context) {
  return handleLeaderboardIndex(context);
}
