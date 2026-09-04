(function attachLeaderboardsApi(window) {
  const apiClient = new APIProxyClient(window.location.origin);
  apiClient.cacheDuration.leaderboards = 60000;

  function getPayloadData(payload) {
    if (payload && typeof payload === "object" && "leaderboard" in payload) {
      return payload.leaderboard;
    }

    return payload;
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isLeaderboardRowArray(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return false;
    }

    return items.every(function checkItem(item) {
      return isPlainObject(item) && !("players" in item) && !("categories" in item) && !("types" in item) && !("tiers" in item);
    });
  }

  function withPositions(data) {
    if (Array.isArray(data)) {
      if (isLeaderboardRowArray(data)) {
        return data.map(function addPosition(item, index) {
          return {
            ...item,
            rank: item.rank ?? index + 1
          };
        });
      }

      return data.map(withPositions);
    }

    if (isPlainObject(data)) {
      const normalized = {};

      Object.entries(data).forEach(function normalizeEntry(entry) {
        const key = entry[0];
        const value = entry[1];
        normalized[key] = withPositions(value);
      });

      return normalized;
    }

    return data;
  }

  function getPlayerCellHtml(name) {
    if (typeof window.createPlayerCell === "function") {
      return window.createPlayerCell(name || "???");
    }

    return `<td>${name || "???"}</td>`;
  }

  function getPlaceholderRows(count, scoreText) {
    return Array.from({ length: count }, function buildRow(_, index) {
      return `
        <tr>
          <td>${index + 1}</td>
          ${getPlayerCellHtml("???")}
          <td>${scoreText || "???"}</td>
        </tr>
      `;
    }).join("");
  }

  function getLocalFallback(id) {
    const norm = String(id).toLowerCase().replace(/_/g, '-');
    if (norm === 'collections' && typeof window.collectionsData !== 'undefined') return window.collectionsData;
    if (norm === 'skills' && typeof window.skillsLeaderboards !== 'undefined') return window.skillsLeaderboards;
    if (norm === 'skills' && typeof window.skillsData !== 'undefined') return window.skillsData;
    if (norm === 'slayers' && typeof window.slayersData !== 'undefined') return window.slayersData;
    if (norm === 'coins' && typeof window.coinsData !== 'undefined') return window.coinsData;
    if (norm === 'pets' && typeof window.petsData !== 'undefined') return window.petsData;
    if (norm === 'pets' && typeof window.petsLeaderboards !== 'undefined') return window.petsLeaderboards;
    if ((norm === 'boss-times' || norm === 'boss-time') && typeof window.bossTimesData !== 'undefined') return window.bossTimesData;
    if ((norm === 'boss-times' || norm === 'boss-time') && typeof window.collectionsData !== 'undefined') return window.collectionsData;
    if (norm === 'farming-contests' && typeof window.farmingContestsData !== 'undefined') return window.farmingContestsData;
    if ((norm === 'average-skill' || norm === 'avg-skill') && typeof window.skillData !== 'undefined') return window.skillData;
    if (norm === 'achievements' && typeof window.achievementsData !== 'undefined') return window.achievementsData;
    if (norm === 'cakes' && typeof window.cakeData !== 'undefined') return window.cakeData;
    if (norm === 'gems' && typeof window.gemsData !== 'undefined') return window.gemsData;
    if (norm === 'crafters-level' && typeof window.levelsData !== 'undefined') return window.levelsData;
    if (norm === 'networth' && typeof window.networthData !== 'undefined') return window.networthData;
    if (norm === 'damage' && typeof window.damageData !== 'undefined') return window.damageData;
    if (norm === 'arctic-cave-race' && typeof window.arcticCaveRaceData !== 'undefined') return window.arcticCaveRaceData;
    if (norm === 'target-practice' && typeof window.targetPracticeData !== 'undefined') return window.targetPracticeData;
    if (norm === 'ender-node-hunt' && typeof window.enderNodeHuntData !== 'undefined') return window.enderNodeHuntData;
    if (norm === 'playtime' && typeof window.playtimeData !== 'undefined') return window.playtimeData;
    return null;
  }

  window.leaderboardsApi = {
    async getCatalog() {
      try {
        return await apiClient.makeRequest("/api/leaderboards");
      } catch (e) {
        console.warn("[Leaderboards API] Fallback for catalog:", e.message);
        return {};
      }
    },

    async getLeaderboard(id) {
      try {
        const payload = await apiClient.makeRequest(`/api/leaderboards/${encodeURIComponent(id)}`);
        return withPositions(getPayloadData(payload));
      } catch (err) {
        console.warn(`[Leaderboards API] Failed to fetch /api/leaderboards/${id}, checking local fallback...`, err.message);
        const fallback = getLocalFallback(id);
        if (fallback) {
          return withPositions(fallback);
        }
        throw err;
      }
    },

    getPlayerCellHtml,
    getPlaceholderRows,
    withPositions
  };
})(window);
