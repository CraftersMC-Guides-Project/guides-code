/**
 * API Proxy Helper - Cloudflare Function Integration
 * Handles communication with the Cloudflare Function API Proxy
 */

class APIProxyClient {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl || 'https://craftersmc-guides.pages.dev';
    this.cache = new Map();
    this.cacheDuration = {
      bazaar: 30000,      // 30 seconds for bazaar data
      player: 300000,     // 5 minutes for player data
      profile: 300000     // 5 minutes for profile data
    };
  }

  normalizeBazaarItem(item) {
    if (!item || typeof item !== 'object') return item;
    if (item.buyTopEntries && item.sellTopEntries) return item;

    return {
      itemId: item.item_id || item.itemId || null,
      fetchedAt: item.fetched_at || item.fetchedAt || null,
      buyTopEntries: [
        {
          price: item.buy_price ?? 0,
          quantity: item.buy_volume ?? 0
        }
      ],
      sellTopEntries: [
        {
          price: item.sell_price ?? 0,
          quantity: item.sell_volume ?? 0
        }
      ],
      weeklyAveragePrice: item.avg_7d_price ?? 0,
      buyVolume: item.buy_volume ?? 0,
      sellVolume: item.sell_volume ?? 0
    };
  }

  /**
   * Update API configuration
   */
  setConfig(proxyUrl) {
    this.proxyUrl = proxyUrl || this.proxyUrl;
  }

  /**
   * Check if request is cached and still valid
   */
  getFromCache(cacheKey, type = 'bazaar') {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const duration = this.cacheDuration[type] || 30000;
    if (Date.now() - cached.timestamp < duration) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    this.cache.delete(cacheKey);
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Make a request to the API Proxy
   */
  async makeRequest(endpoint, options = {}) {
    const baseUrl = this.proxyUrl.replace(/\/$/, '');
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get bazaar item details
   */
  async getBazaarItem(itemId) {
    const normalizedItemId = String(itemId || '').trim().toLowerCase();
    const cacheKey = `bazaar_item_${normalizedItemId}`;
    const cached = this.getFromCache(cacheKey, 'bazaar');
    if (cached) return cached;

    try {
      const snapshot = await this.getLatestBazaarSnapshot();
      const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
      const matchedItem = items.find((entry) => {
        const entryId = String(entry?.item_id || entry?.itemId || '').trim().toLowerCase();
        return entryId === normalizedItemId;
      });

      if (!matchedItem) {
        throw new Error(`Bazaar item not found in latest snapshot: ${itemId}`);
      }

      const normalized = this.normalizeBazaarItem(matchedItem);
      this.setCache(cacheKey, normalized);
      return normalized;
    } catch (error) {
      console.error(`Failed to fetch bazaar data for ${itemId}:`, error);
      throw error;
    }
  }

  async getLatestBazaarSnapshot() {
    const cacheKey = 'bazaar_latest_snapshot';
    const cached = this.getFromCache(cacheKey, 'bazaar');
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/api/latest-bazaar-backup');
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch latest bazaar snapshot:', error);
      throw error;
    }
  }

  async getBazaarItems() {
    const snapshot = await this.getLatestBazaarSnapshot();
    const items = Array.isArray(snapshot?.items) ? snapshot.items : [];

    return items
      .map((entry) => entry?.item_id || entry?.itemId)
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b)));
  }

  async getBazaarHistory(itemId) {
    const normalizedItemId = String(itemId || '').trim().toLowerCase();
    const cacheKey = `bazaar_history_${normalizedItemId}`;
    const cached = this.getFromCache(cacheKey, 'bazaar');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/api/history/${encodeURIComponent(normalizedItemId)}`);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch bazaar history for ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Get player data
   */
  async getPlayer(username) {
    // Check cache first
    const cached = this.getFromCache(username, 'player');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/player/${username}`);
      this.setCache(username, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch player data for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get profile data
   */
  async getProfile(profileId) {
    // Check cache first
    const cached = this.getFromCache(profileId, 'profile');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/profile/${profileId}`);
      this.setCache(profileId, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch profile data for ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Get auctions with optional page number
   */
  async getAuctions(page = 0) {
    const cacheKey = `auctions_page_${page}`;
    // Check cache first
    const cached = this.getFromCache(cacheKey, 'bazaar');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/api/auctions?page=${page}`);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch auctions for page ${page}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(cacheKey) {
    this.cache.delete(cacheKey);
  }
}

// Export for use in both modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIProxyClient;
}
