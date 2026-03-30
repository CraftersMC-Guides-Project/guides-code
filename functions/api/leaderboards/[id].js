import { handleLeaderboardDetail } from "../_leaderboards.js";

export async function onRequest(context) {
  return handleLeaderboardDetail(context);
}
