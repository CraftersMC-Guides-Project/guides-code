(function attachLeaderboardsApi(window) {
  const apiClient = new APIProxyClient(window.location.origin);
  apiClient.cacheDuration.leaderboards = 60000;

  function getPayloadData(payload) {
    if (payload && typeof payload === "object" && "leaderboard" in payload) {
      return payload.leaderboard;
    }

    return payload;
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
      return getPayloadData(payload);
    },

    getPlayerCellHtml,
    getPlaceholderRows
  };
})(window);
