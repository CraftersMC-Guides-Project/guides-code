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

  window.leaderboardsApi = {
    async getCatalog() {
      return apiClient.makeRequest("/api/leaderboards");
    },

    async getLeaderboard(id) {
      const payload = await apiClient.makeRequest(`/api/leaderboards/${encodeURIComponent(id)}`);
      return withPositions(getPayloadData(payload));
    },

    getPlayerCellHtml,
    getPlaceholderRows,
    withPositions
  };
})(window);
