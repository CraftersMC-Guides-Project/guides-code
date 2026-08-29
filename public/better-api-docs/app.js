/**
 * Better API Docs - Application Engine (100% Pure Monochrome Documentation Webpage)
 */

const API_BASE_URL = "https://api.craftersmc.net";

// Embedded fallback OpenAPI specification matching full v1-5eb3568 spec
const EMBEDDED_OPENAPI_SPEC = {
  "openapi": "3.0.3",
  "info": {
    "title": "CraftersMC Public API",
    "version": "v1-5eb3568",
    "x-git": {
      "commit": "5eb3568",
      "branch": "main",
      "time": "2026-08-23T23:24:28+0300"
    },
    "x-logo": {
      "url": "https://craftersmc.net/data/assets/logo/newOriginal512.png",
      "altText": "CraftersMC"
    }
  },
  "paths": {
    "/v1/network/status": {
      "get": {
        "tags": ["Network"],
        "summary": "Network Status",
        "description": "Returns current network status including online player count.",
        "parameters": [],
        "responses": {
          "200": { "description": "Network status", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ServerStatusReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/network/voters": {
      "get": {
        "tags": ["Network"],
        "summary": "Vote List",
        "description": "Returns the list of players who voted for the network this month, with their vote counts.\n\nThe list is refreshed periodically (every few hours) from the voting site.\nThe `fetchedAt` field is the Unix timestamp (milliseconds) of when the list was last retrieved.\n",
        "parameters": [],
        "responses": {
          "200": { "description": "Vote list", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/VotersReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Vote list has not been populated yet", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/player/{identifier}": {
      "get": {
        "tags": ["Players"],
        "summary": "Player",
        "description": "Retrieves basic profile information for a player by their username, UUID, or Pixel ID.",
        "parameters": [
          { "name": "identifier", "in": "path", "description": "Player username, UUID, or Pixel ID", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "Player found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PlayerReply" } } } },
          "400": { "description": "Invalid identifier", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "404": { "description": "Player not found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/resources/skyblock/bazaar/items": {
      "get": {
        "tags": ["SkyBlock Bazaar"],
        "summary": "Item List",
        "description": "Get a list of available items in Bazaar.\n",
        "parameters": [],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/BazaarItemListReply" } } } }
        }
      }
    },
    "/v1/skyblock/auction/{auctionId}": {
      "get": {
        "tags": ["SkyBlock Auctions"],
        "summary": "Auction Details",
        "description": "Get the details of a specific auction by its ID, including all bids placed on it.\n",
        "parameters": [
          { "name": "auctionId", "in": "path", "description": "The auction ID", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuctionReply" } } } },
          "400": { "description": "Invalid auction ID", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "404": { "description": "Auction not found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Service temporarily unavailable", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/auctions": {
      "get": {
        "tags": ["SkyBlock Auctions"],
        "summary": "Active Auctions",
        "description": "Get a paginated list of all currently active auctions.\n",
        "parameters": [
          { "name": "page", "in": "query", "description": "Page number (starts at 0)", "required": false, "schema": { "type": "integer", "format": "int32" } }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuctionPageReply" } } } },
          "400": { "description": "Invalid page number", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Service temporarily unavailable", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/auctions/ended": {
      "get": {
        "tags": ["SkyBlock Auctions"],
        "summary": "Recently Ended Auctions",
        "description": "Get auctions that ended within the last 60 seconds.\n",
        "parameters": [],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuctionPageReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Service temporarily unavailable", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/auctions/player/{uuid}": {
      "get": {
        "tags": ["SkyBlock Auctions"],
        "summary": "Player Auctions",
        "description": "Get all auctions owned by a specific player.\n",
        "parameters": [
          { "name": "uuid", "in": "path", "description": "The player's UUID", "required": true, "schema": { "type": "string" } },
          { "name": "profileId", "in": "query", "description": "SkyBlock profile ID to filter by", "required": false, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuctionsReply" } } } },
          "400": { "description": "Invalid UUID", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Service temporarily unavailable", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/bazaar/{itemId}/details": {
      "get": {
        "tags": ["SkyBlock Bazaar"],
        "summary": "Item Details",
        "description": "Get the details of a Bazaar item (top buy entries, top sell entries, buy volume and sell volume).\n",
        "parameters": [
          { "name": "itemId", "in": "path", "description": "Identifier of the item, see the items endpoint for list of available values.", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/BazaarItemReply" } } } },
          "400": { "description": "Given itemId is not allowed", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "404": { "description": "Data was not populated yet", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "503": { "description": "Service temporarily unavailable", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/profile/{profileId}": {
      "get": {
        "tags": ["SkyBlock"],
        "summary": "SkyBlock Profile",
        "description": "Retrieves a SkyBlock profile including member stats, banking, collections, and inventories.\n",
        "parameters": [
          { "name": "profileId", "in": "path", "description": "UUID of the SkyBlock profile (32 hex characters, no dashes)", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "Profile found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/SkyBlockProfileReply" } } } },
          "400": { "description": "Invalid profile ID format", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "404": { "description": "Profile not found", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    },
    "/v1/skyblock/settings": {
      "get": {
        "tags": ["SkyBlock"],
        "summary": "SkyBlock Settings",
        "description": "Retrieves global SkyBlock Settings (banner image queue for the SkyBlock Menu).\n",
        "parameters": [],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/SkyBlockSettingsReply" } } } },
          "403": { "description": "Missing required API scope", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "404": { "description": "Settings were not populated yet.", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } },
          "429": { "description": "Rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ApiErrorReply" } } } }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ServerStatusReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "playerCount": { "type": "integer", "format": "int32" },
          "maxPlayerCount": { "type": "integer", "format": "int32" },
          "fullMaintenance": { "type": "boolean" },
          "whitelistRank": { "$ref": "#/components/schemas/PlayerRank" },
          "games": { "$ref": "#/components/schemas/GameCount" },
          "plannedMaintenance": { "$ref": "#/components/schemas/PlannedMaintenance" }
        },
        "required": ["success", "playerCount", "maxPlayerCount", "fullMaintenance"]
      },
      "VotersReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "month": { "type": "string" },
          "fetchedAt": { "type": "integer", "format": "int64" },
          "count": { "type": "integer", "format": "int32" },
          "voters": { "type": "array", "items": { "$ref": "#/components/schemas/Voter" } }
        },
        "required": ["success", "fetchedAt", "count"]
      },
      "Voter": {
        "type": "object",
        "properties": {
          "nickname": { "type": "string" },
          "votes": { "type": "integer", "format": "int32" }
        },
        "required": ["votes"]
      },
      "PlayerReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "player": { "$ref": "#/components/schemas/Player" }
        },
        "required": ["success"]
      },
      "Player": {
        "type": "object",
        "properties": {
          "pixelId": { "type": "string" },
          "name": { "type": "string" },
          "nameHistory": { "type": "array", "items": { "type": "string" } },
          "totalPlaytime": { "type": "integer", "format": "int64" },
          "playtimePerGame": { "type": "object" },
          "lastServer": { "$ref": "#/components/schemas/ServerType" },
          "networkCoins": { "type": "integer", "format": "int64" },
          "selectedRank": { "$ref": "#/components/schemas/PlayerRank" },
          "rank": { "$ref": "#/components/schemas/PlayerRankInfo" },
          "privateMessages": { "$ref": "#/components/schemas/PrivateMessages" },
          "friendRequests": { "$ref": "#/components/schemas/FriendRequests" },
          "unlockedCollectables": { "type": "array", "items": { "type": "string" } },
          "firstLogin": { "type": "string", "format": "date-time" },
          "lastLogin": { "type": "string", "format": "date-time" },
          "lastSeenProtocol": { "type": "integer", "format": "int32" }
        },
        "required": ["totalPlaytime", "networkCoins", "selectedRank"]
      },
      "BazaarItemListReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "items": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["success"]
      },
      "BazaarItemReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "itemId": { "type": "string" },
          "buyTopEntries": { "type": "array", "items": { "$ref": "#/components/schemas/TopEntry" } },
          "sellTopEntries": { "type": "array", "items": { "$ref": "#/components/schemas/TopEntry" } },
          "buyVolume": { "type": "integer", "format": "int32" },
          "sellVolume": { "type": "integer", "format": "int32" },
          "weeklyAveragePrice": { "type": "number", "format": "double" }
        },
        "required": ["success", "buyVolume", "sellVolume", "weeklyAveragePrice"]
      },
      "TopEntry": {
        "type": "object",
        "properties": {
          "price": { "type": "number", "format": "double" },
          "quantity": { "type": "integer", "format": "int32" },
          "orderCount": { "type": "integer", "format": "int32" }
        },
        "required": ["price", "quantity", "orderCount"]
      },
      "AuctionReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "auction": { "$ref": "#/components/schemas/ApiAuctionEntry" },
          "bids": { "type": "array", "items": { "$ref": "#/components/schemas/AuctionBidResponse" } }
        },
        "required": ["success"]
      },
      "AuctionPageReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "page": { "type": "integer", "format": "int32" },
          "totalPages": { "type": "integer", "format": "int32" },
          "totalAuctions": { "type": "integer", "format": "int32" },
          "lastUpdated": { "type": "integer", "format": "int64" },
          "auctions": { "type": "array", "items": { "$ref": "#/components/schemas/ApiAuctionEntry" } }
        },
        "required": ["success", "page", "totalPages", "totalAuctions", "lastUpdated"]
      },
      "AuctionsReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "lastUpdated": { "type": "integer", "format": "int64" },
          "auctions": { "type": "array", "items": { "$ref": "#/components/schemas/ApiAuctionEntry" } }
        },
        "required": ["success"]
      },
      "ApiAuctionEntry": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "createdAt": { "type": "integer", "format": "int64" },
          "quantity": { "type": "integer", "format": "int32" },
          "itemData": { "type": "string" },
          "itemId": { "type": "string" },
          "tier": { "type": "string" },
          "category": { "type": "string" },
          "startingPrice": { "type": "number", "format": "double" },
          "endsAt": { "type": "integer", "format": "int64" },
          "highestBidAmount": { "type": "number", "format": "double" },
          "highestBidderName": { "type": "string" },
          "bids": { "type": "integer", "format": "int32" },
          "ownerName": { "type": "string" },
          "ownerClaimed": { "type": "boolean" },
          "winnerClaimed": { "type": "boolean" },
          "ended": { "type": "boolean" }
        },
        "required": ["createdAt", "quantity", "startingPrice", "endsAt", "highestBidAmount", "bids", "ownerClaimed", "winnerClaimed", "ended"]
      },
      "AuctionBidResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "auctionId": { "type": "string" },
          "bidderName": { "type": "string" },
          "amount": { "type": "number", "format": "double" },
          "timestamp": { "type": "integer", "format": "int64" }
        },
        "required": ["amount", "timestamp"]
      },
      "SkyBlockProfileReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "profile": { "$ref": "#/components/schemas/SkyBlockProfile" }
        },
        "required": ["success"]
      },
      "SkyBlockProfile": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "gameMode": { "$ref": "#/components/schemas/SkyBlockProfileType" },
          "cuteName": { "$ref": "#/components/schemas/CuteProfileName" },
          "createdAt": { "type": "integer", "format": "int64" },
          "banking": { "$ref": "#/components/schemas/SkyBlockBank" },
          "members": { "type": "object" }
        },
        "required": ["gameMode", "createdAt"]
      },
      "SkyBlockBank": {
        "type": "object",
        "properties": {
          "tier": { "$ref": "#/components/schemas/SkyBlockBankAccountTier" },
          "balance": { "type": "number", "format": "double" },
          "highestBalance": { "type": "number", "format": "double" }
        },
        "required": ["balance", "highestBalance"]
      },
      "SkyBlockSettingsReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "settings": { "$ref": "#/components/schemas/SkyBlockSettings" }
        },
        "required": ["success"]
      },
      "SkyBlockSettings": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "menuBannerQueue": { "type": "array", "items": { "$ref": "#/components/schemas/MenuBanner" } }
        }
      },
      "MenuBanner": {
        "type": "object",
        "properties": {
          "expireAt": { "type": "integer", "format": "int64" },
          "images": { "type": "object" }
        },
        "required": ["expireAt"]
      },
      "ApiErrorReply": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "error": { "type": "string" },
          "message": { "type": "string" }
        },
        "required": ["success"]
      },
      "PlayerRank": {
        "type": "string",
        "enum": ["DEFAULT", "VOTER", "OLD_GOLD", "OLD_DIAMOND", "OLD_EMERALD", "GOLD", "DIAMOND", "EMERALD", "YOUTUBER", "TRAINEE", "HELPER", "BUILDER", "MODERATOR", "DEVELOPER", "SR_MODERATOR", "ADMIN", "OWNER"]
      },
      "ServerType": {
        "type": "string",
        "enum": ["HUB", "SKYBLOCK_HUB", "SKYBLOCK_ISLAND", "SKYBLOCK_MINING_1", "SKYBLOCK_THE_PARK", "LIMBO", "SKYBLOCK_END"]
      },
      "ItemRarity": {
        "type": "string",
        "enum": ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "SUPREME", "SPECIAL", "VERY_SPECIAL"]
      },
      "CuteProfileName": {
        "type": "string",
        "enum": ["APPLE", "BANANA", "BLUEBERRY", "COCONUT", "CUCUMBER", "GRAPES", "KIWI", "LEMON", "LIME", "MANGO", "ORANGE", "PAPAYA", "PEAR", "PEACH", "PINEAPPLE", "POMEGRANTE", "RASPBERRY", "STRAWBERRY", "TOMATO", "WATERMELON", "ZUCCHINI", "STARFRUIT", "PLUM", "MANDARIN", "CHERRY", "QUINCE", "DRAGONFRUIT", "AVOCADO"]
      },
      "SkyBlockBankAccountTier": {
        "type": "string",
        "enum": ["BASIC", "EXCLUSIVE", "ELITE", "SUPER_ELITE", "BILLIONAIRE", "MULTI_BILLIONAIRE"]
      },
      "SkyBlockProfileType": {
        "type": "string",
        "enum": ["DEFAULT", "IRONMAN", "STRANDED"]
      },
      "SlayerType": {
        "type": "string",
        "enum": ["ZOMBIE", "WOLF", "SPIDER"]
      },
      "QuestStatus": {
        "type": "string",
        "enum": ["COMPLETE", "ACTIVE"]
      },
      "ChatChannel": {
        "type": "string",
        "enum": ["LOCAL", "GLOBAL", "COOP"]
      },
      "PrivateMessages": {
        "type": "string",
        "enum": ["ALL", "ONLY_FRIENDS", "NONE"]
      },
      "FriendRequests": {
        "type": "string",
        "enum": ["ALL", "FRIENDS_OF_FRIEND", "NONE"]
      },
      "AcceptedIslandVisits": {
        "type": "string",
        "enum": ["ALL", "FRIENDS", "NONE"]
      }
    }
  }
};

let openApiSpec = EMBEDDED_OPENAPI_SPEC;

// Exhaustive 4-part in-depth documentation guides for every single endpoint
const ENDPOINT_GUIDES = {
  "/v1/network/status": {
    howItWorks: "Retrieves operational status and real-time player distribution across CraftersMC network sub-servers. It aggregates online player count, total network capacity, active sub-game instances (e.g. SkyBlock hubs, islands, mining zones), and scheduled or active maintenance windows.",
    responseBreakdown: "Returns a <code>ServerStatusReply</code> JSON envelope. The top-level <code>playerCount</code> and <code>maxPlayerCount</code> fields give network capacity. The <code>games</code> map contains specific sub-server player numbers, while <code>fullMaintenance</code> and <code>plannedMaintenance</code> warn about downtime.",
    howToDecode: "All timestamps in <code>plannedMaintenance</code> are Unix Epoch milliseconds. Convert to human-readable date in JS via <code>new Date(data.plannedMaintenance.startTimestamp).toLocaleString()</code>.",
    howToImplement: "Send an HTTP GET request to <code>https://api.craftersmc.net/v1/network/status</code>. Recommended polling frequency is once every 15 to 30 seconds."
  },
  "/v1/network/voters": {
    howItWorks: "Returns the monthly voting leaderboard of players who voted for CraftersMC across public Minecraft server voting sites. The system syncs vote site APIs periodically (every few hours). The <code>fetchedAt</code> field gives the exact timestamp when this list was compiled.",
    responseBreakdown: "Returns <code>VotersReply</code> envelope containing <code>month</code> (e.g. '2026-08'), <code>fetchedAt</code> (int64 millisecond timestamp), <code>count</code> (total voters returned), and <code>voters</code> (array of Voter objects with <code>nickname</code> and <code>votes</code>). If data is unpopulated, returns <code>503 Service Unavailable</code>.",
    howToDecode: "Check data freshness in JavaScript: <code>const minutesAgo = Math.round((Date.now() - data.fetchedAt) / 60000);</code>. The <code>voters</code> array is pre-sorted in descending order by vote count.",
    howToImplement: "Handle HTTP 503 errors by retrying after 60 seconds. Set background polling intervals to 1-2 hours."
  },
  "/v1/player/{identifier}": {
    howItWorks: "Retrieves detailed player profile data using a Minecraft username, 32-character hexadecimal UUID, or Pixel ID. Returns active rank, total playtime, per-game playtime breakdown, last seen sub-server, and privacy settings.",
    responseBreakdown: "Returns <code>PlayerReply</code> wrapping a <code>Player</code> object. Contains <code>totalPlaytime</code> (int64 ms), <code>playtimePerGame</code> (map), <code>rank</code> (rank metadata), <code>privateMessages</code>, and <code>friendRequests</code> settings. Returns 400 for invalid format and 404 for unknown players.",
    howToDecode: "Convert millisecond playtime to total hours: <code>const totalHours = (player.totalPlaytime / 3600000).toFixed(1);</code>. Dates like <code>firstLogin</code> and <code>lastLogin</code> use ISO-8601 strings.",
    howToImplement: "Pass either username (3-16 chars) or 32-hex UUID into the path parameter. Always handle <code>404 Not Found</code> for players who haven't logged in."
  },
  "/v1/resources/skyblock/bazaar/items": {
    howItWorks: "Returns a complete array of all active SkyBlock Bazaar item identifiers currently traded on the market. Used as an index endpoint to fetch item keys before querying order books.",
    responseBreakdown: "Returns <code>BazaarItemListReply</code> with an <code>items</code> array of uppercase snake_case string identifiers (e.g., <code>['ENCHANTED_PORK', 'DIAMOND', 'SUPER_COMPACTOR_3000']</code>).",
    howToDecode: "Store the array in memory or local storage. Refresh once per hour to capture newly introduced market items.",
    howToImplement: "Fetch this list at application startup, then iterate over item IDs to request detailed order books from <code>/v1/skyblock/bazaar/{itemId}/details</code>."
  },
  "/v1/skyblock/auction/{auctionId}": {
    howItWorks: "Retrieves complete details for a single SkyBlock auction listing by its 32-character hexadecimal UUID, including seller info, prices, bid history, item stack quantity, and Base64 NBT item binary data.",
    responseBreakdown: "Returns <code>AuctionReply</code> envelope with an <code>auction</code> (ApiAuctionEntry) and <code>bids</code> (array of AuctionBidResponse objects).",
    howToDecode: "The <code>itemData</code> field is a Base64-encoded GZIP-compressed NBT binary compound. In Node.js: <code>const buf = Buffer.from(itemData, 'base64'); const nbtData = zlib.gunzipSync(buf);</code>",
    howToImplement: "Use when inspecting a specific auction listing. Check <code>ended</code> boolean to verify if the listing is closed."
  },
  "/v1/skyblock/auctions": {
    howItWorks: "Returns a paginated list of all active SkyBlock auctions currently open for bidding. Uses 0-indexed page numbers (page=0 is the first page).",
    responseBreakdown: "Returns <code>AuctionPageReply</code> with <code>page</code> (current page), <code>totalPages</code> (total available pages), <code>totalAuctions</code> (total active listings), <code>lastUpdated</code> (sync timestamp), and <code>auctions</code> (array of ApiAuctionEntry objects).",
    howToDecode: "Loop through pages from <code>page=0</code> to <code>totalPages - 1</code> to index the full market. Unpack NBT <code>itemData</code> Base64 strings to read enchants and lore.",
    howToImplement: "Add a 100ms throttle between page requests to avoid hitting rate limit thresholds (`429 Rate Limit Exceeded`)."
  },
  "/v1/skyblock/auctions/ended": {
    howItWorks: "Returns auctions that expired or were bought out within the last 60 seconds. Critical for price indexers, sales tickers, and auction house analytics.",
    responseBreakdown: "Returns <code>AuctionPageReply</code> containing recently ended auctions. Includes winning bid amounts, winning bidder names, and final sale prices.",
    howToDecode: "Calculate exact end time delta via <code>data.lastUpdated - auction.endsAt</code>. Parse <code>highestBidAmount</code> to determine sale price.",
    howToImplement: "Poll once every 30 to 60 seconds to build real-time market sales trackers or historical price charts."
  },
  "/v1/skyblock/auctions/player/{uuid}": {
    howItWorks: "Returns all active and historical auctions created by a specific player identified by their 32-hex Minecraft UUID, with optional filtering by SkyBlock profileId.",
    responseBreakdown: "Returns <code>AuctionsReply</code> envelope containing an <code>auctions</code> array of ApiAuctionEntry objects.",
    howToDecode: "Pass optional <code>profileId</code> query parameter to filter listings from a specific SkyBlock co-op profile.",
    howToImplement: "Use when rendering player profile pages or displaying a player's active listings in custom market apps."
  },
  "/v1/skyblock/bazaar/{itemId}/details": {
    howItWorks: "Retrieves order book details for a specific Bazaar item ID, including top buy offers, top sell offers, total buy volume, total sell volume, and 7-day weighted average price.",
    responseBreakdown: "Returns <code>BazaarItemReply</code> containing <code>buyTopEntries</code>, <code>sellTopEntries</code>, <code>buyVolume</code>, <code>sellVolume</code>, and <code>weeklyAveragePrice</code>.",
    howToDecode: "Instant sell price = highest price in <code>buyTopEntries</code>. Instant buy price = lowest price in <code>sellTopEntries</code>. Profit margin = <code>instantSell - instantBuy</code>.",
    howToImplement: "Query this endpoint for items of interest to display live Bazaar tickers or margin calculation tools."
  },
  "/v1/skyblock/profile/{profileId}": {
    howItWorks: "Retrieves complete SkyBlock profile member data for all co-op members, including bank balance, collections, minion crafts, skill levels, slayer stats, and Base64 NBT inventories.",
    responseBreakdown: "Returns <code>SkyBlockProfileReply</code> containing <code>profile</code> (SkyBlockProfile object) and member stats. If a member disabled API access, inventory fields return 403 scope error or are omitted.",
    howToDecode: "Inventories (<code>inventoryContents</code>, <code>armorContents</code>, <code>enderContents</code>, <code>petInventory</code>, <code>accessoryBag</code>, <code>quiver</code>) are Base64 GZIP NBT strings. Decompress and parse NBT compound to extract item lore, enchants, and stats.",
    howToImplement: "Always inspect <code>success</code> and check for missing API scope errors (<code>403 Forbidden</code>). Calculate networth by summing purse, bank, inventory items, and bazaar values."
  },
  "/v1/skyblock/settings": {
    howItWorks: "Retrieves global SkyBlock configuration settings, including the banner image queue for the SkyBlock Menu in-game GUI.",
    responseBreakdown: "Returns <code>SkyBlockSettingsReply</code> containing <code>settings</code> (SkyBlockSettings object) with <code>menuBannerQueue</code> array of MenuBanner objects.",
    howToDecode: "Examine <code>expireAt</code> timestamp on menu banners to display only active, unexpired banner images.",
    howToImplement: "Fetch once on app load to render active SkyBlock server banners or announcements."
  }
};

// Exhaustive Field Dictionary explaining every JSON field across all endpoints and schemas in minute detail
const FIELD_DESCRIPTIONS = {
  success: "Boolean flag indicating whether the API request executed cleanly (true for HTTP 200).",
  error: "Error classification title or code string returned when a request fails.",
  message: "Human-readable explanation detailing the reason for failure or missing API scope.",

  playerCount: "Current number of online players connected to the CraftersMC network.",
  maxPlayerCount: "Maximum capacity / player cap configured for the network.",
  fullMaintenance: "True if the entire network is currently under maintenance mode (only staff can join).",
  plannedMaintenance: "Object detailing upcoming or active maintenance events.",
  whitelistRank: "Minimum rank required to join when the server is in whitelist / restricted mode.",
  games: "Map of active game modes (e.g., SkyBlock) to their current player count breakdown.",
  modes: "Map of specific game sub-modes to their online player counts.",
  reason: "Explanation message for planned server maintenance.",
  startTimestamp: "Unix timestamp in milliseconds when planned maintenance will begin.",
  estimatedTime: "Estimated duration of planned maintenance in milliseconds.",
  args: "Optional metadata arguments accompanying maintenance notifications.",

  voters: "Array of Voter objects who voted for CraftersMC during the current calendar month.",
  nickname: "In-game player username / ign of the voter.",
  votes: "Total number of votes cast by this player during the active month.",
  month: "Target calendar month string for the vote leaderboard (e.g., '2026-08').",
  fetchedAt: "Unix timestamp in milliseconds when the vote leaderboard was last synced from the voting sites.",
  count: "Total count of unique voters returned in this response list.",

  player: "Detailed Player profile container object.",
  pixelId: "Unique identifier for the player's Pixel account.",
  name: "Current Minecraft username of the player.",
  identifier: "Player username, UUID, or Pixel ID.",
  nameHistory: "Array of past Minecraft usernames used by this player.",
  totalPlaytime: "Total accumulated playtime across all sub-servers in milliseconds.",
  playtimePerGame: "Breakdown of total playtime in milliseconds categorized by game mode (e.g. SKYBLOCK).",
  lastServer: "The server instance type where the player was last seen online (e.g. SKYBLOCK_HUB).",
  networkCoins: "Global network coins balance shared across lobby games.",
  selectedRank: "The active primary rank currently rendered on the player's profile and nametag.",
  rank: "Full rank details object including active subscription end dates, colors, prefixes, and suffixes.",
  ranks: "Map of rank identifiers to their active duration and color settings.",
  textColor: "Chat text color hex code or formatting code associated with this rank.",
  nameColor: "Nametag color code for the rank.",
  prefix: "In-game text prefix displayed before the player's username.",
  suffix: "In-game text suffix displayed after the player's username.",
  endAt: "ISO-8601 timestamp string when a timed rank subscription expires.",
  privateMessages: "Player privacy setting for direct messages (ALL, ONLY_FRIENDS, NONE).",
  friendRequests: "Player privacy setting for incoming friend invites (ALL, FRIENDS_OF_FRIEND, NONE).",
  unlockedCollectables: "List of cosmetic collectable identifiers unlocked by this player.",
  selectedPet: "Currently active cosmetic pet in lobbies.",
  selectedParticle: "Currently active particle effect.",
  selectedSuitHelmet: "Equipped lobby helmet cosmetic.",
  selectedSuitChestplate: "Equipped lobby chestplate cosmetic.",
  selectedSuitLeggings: "Equipped lobby leggings cosmetic.",
  selectedSuitBoots: "Equipped lobby boots cosmetic.",
  selectedGadget: "Equipped lobby gadget item.",
  selectedMorph: "Equipped lobby player morph.",
  playingMusic: "Currently playing jukebox track identifier.",
  musicQueue: "Queued music track identifiers.",
  musicShuffle: "True if lobby music shuffle mode is enabled.",
  language: "Preferred language code selected by the player.",
  stats: "Game specific statistics container (e.g. SkyBlock stats summary).",
  firstLogin: "ISO-8601 timestamp string of when the player first connected to CraftersMC.",
  lastLogin: "ISO-8601 timestamp string of when the player last logged into CraftersMC.",
  lastSeenProtocol: "Minecraft client protocol version number recorded on last login (e.g., 763 for 1.20.1).",
  lastVoteClaimedTime: "Unix timestamp in milliseconds when the player last claimed a vote reward.",

  auctions: "Array of ApiAuctionEntry objects matching the search or player parameters.",
  auction: "Target ApiAuctionEntry object containing seller, price, bid history, and item NBT data.",
  id: "Unique 32-character hexadecimal UUID of the auction listing or profile.",
  auctionId: "Unique 32-character hexadecimal UUID of the target auction listing.",
  startingPrice: "Initial starting price or buy-it-now price in coins.",
  endsAt: "Unix timestamp in milliseconds when the auction bidding period expires.",
  highestBidAmount: "Current top bid amount placed on this auction (0 if no bids yet).",
  highestBidId: "Unique identifier of the highest active bid.",
  highestBidderName: "Username of the player currently holding the highest bid.",
  bids: "Total count of bids or array of AuctionBidResponse objects detailing all bids placed.",
  bidderUniqueId: "Minecraft UUID of the bidder.",
  bidderProfileId: "SkyBlock profile UUID of the bidder.",
  bidderName: "In-game Minecraft username of the bidder.",
  amount: "Coin amount offered in this bid.",
  ownerUniqueId: "Minecraft UUID of the seller who created the auction.",
  ownerProfileId: "SkyBlock Profile UUID of the seller.",
  ownerName: "In-game username of the auction seller.",
  ownerClaimed: "True if the seller has already claimed the coins/item after auction completed.",
  winnerUniqueId: "Minecraft UUID of the auction winner.",
  winnerProfileId: "SkyBlock Profile UUID of the auction winner.",
  winnerName: "Username of the winning bidder.",
  winnerClaimed: "True if the winning bidder has claimed their won item.",
  claimedBidders: "List of player UUIDs who have claimed their refunded bids.",
  bidders: "List of unique player UUIDs who placed bids on this auction.",
  ended: "True if the auction has expired or reached buy-it-now fulfillment.",
  cancelReason: "Cancellation reason message if the auction was removed by staff or owner.",
  quantity: "Item stack size / quantity listed in the auction.",
  itemData: "Base64 encoded NBT binary compound string representing full Minecraft item data.",
  tier: "Rarity tier string of the auctioned item (e.g. LEGENDARY, RARE).",
  category: "Auction House category string (WEAPON, ARMOR, ACCESSORY, CONSUMABLE, BLOCKS, MISC).",
  type: "Item type classification string.",
  page: "Current 0-indexed page number of active auctions.",
  totalPages: "Total number of available pages for active auctions.",
  totalAuctions: "Grand total count of currently active auctions.",

  items: "Array of string item identifiers available in the Bazaar or claimed rewards.",
  itemId: "Unique string identifier of the Bazaar item (e.g. 'ENCHANTED_PORK', 'DIAMOND').",
  buyTopEntries: "List of top active buy offers sorted by highest price first.",
  sellTopEntries: "List of top active sell offers sorted by lowest price first.",
  buyVolume: "Total quantity of items currently requested across all open buy orders.",
  sellVolume: "Total quantity of items currently offered across all open sell orders.",
  weeklyAveragePrice: "Weighted 7-day rolling average unit price calculated from fulfilled transactions.",
  price: "Unit price in coins for this order tier.",
  orderCount: "Number of individual orders aggregated at this specific price point.",

  profile: "SkyBlockProfile container object.",
  cuteName: "Fruit/vegetable profile designation assigned to this SkyBlock profile (e.g., 'MANGO', 'APPLE').",
  gameMode: "Profile game mode type (DEFAULT, IRONMAN, STRANDED).",
  createdAt: "Unix timestamp in milliseconds when this profile was created.",
  deletedAt: "Unix timestamp in milliseconds if the profile was deleted, or null if active.",
  craftedMinions: "List of unique minion type and tier identifiers crafted on this profile.",
  playtimes: "Map of member UUIDs to their accumulated SkyBlock playtime on this profile in milliseconds.",
  ownerLastRank: "Primary rank held by the profile creator.",
  collectionContributions: "Nested map of collection items to member contribution amounts.",
  collections: "Map of total collection item identifiers to amounts collected by the co-op.",
  leftMembers: "Map of former member UUIDs to their SkyBlockProfileMember data.",
  ownerUniqueId: "Minecraft UUID of the profile owner.",
  ownerLastName: "Last recorded username of the profile owner.",
  visits: "Island visit permission setting (ALL, FRIENDS, NONE).",
  spawn: "Location5 object detailing island spawn coordinates (x, y, z, yaw, pitch).",
  banking: "Co-op shared bank account details (SkyBlockBank object).",
  members: "Map of player UUIDs to their detailed SkyBlockProfileMember data.",
  teleportPadWarps: "Map of custom teleport pad names to warp coordinates.",
  balance: "Current coin balance stored in the shared co-op bank account.",
  highestBalance: "All-time peak balance recorded in the co-op bank account.",
  unlockedPowerStones: "List of accessory power stone identifiers unlocked by this player.",
  bossKillTimes: "Fastest kill times in milliseconds for SkyBlock boss fights.",
  bossHighestRanks: "Highest tier achieved for boss encounters.",
  summoningEyeContribution: "Map of dragon fights to Summoning Eyes placed by this member.",
  zealotsContribution: "Map of Ender Dragon fights to Zealots slain by this member.",
  bossSummonCounts: "Count of bosses summoned by this member.",
  bossKillCounts: "Count of bosses defeated by this member.",
  maxTotalDamageToBosses: "Highest total damage dealt to boss entities.",
  farmingContestData: "FarmingContestData object containing Jacob's Farming Contest personal bests and medal brackets.",
  personalBests: "Map of crop identifiers to personal best crop yield records.",
  bracketHits: "Map of crop identifiers to array of bracket placement hits (Gold, Silver, Bronze).",
  highestBrackets: "Highest placement tier reached per crop.",
  permanentPerks: "Map of unlocked permanent account perks to level ranks.",
  otherInventories: "Map of inventory keys to Base64 NBT strings for extra storage.",
  chatChannel: "Active chat channel mode (LOCAL, GLOBAL, COOP).",
  dailySkillExperienceData: "Daily skill experience gains and reset timers for Enchanting.",
  targetPracticeData: "Target Practice minigame stats (level, tries, best time ms, last time ms).",
  arcticCaveRaceData: "Arctic Cave Race minigame stats (tries, best time ms, last time ms).",
  enderNodeHuntData: "Ender Node Hunt minigame stats (tries, best time ms, last time ms).",
  relationshipData: "NPC relationship experience, level, and extra metadata.",
  experimentationData: "Superpairs minigame stats, resets, total games, and reset cooldown timers.",
  superpairs: "Count of Superpairs minigames played.",
  superpairResets: "Count of Superpairs resets purchased.",
  totalSuperpairs: "All-time total Superpairs completed.",
  timeLeftUntilReset: "Milliseconds remaining until experimentation table resets.",
  realityShardData: "Reality shard collections, fusion counts, and stat bonuses.",
  collectedShards: "Array of reality shard IDs collected.",
  realityShardStatTotal: "Total stat bonus gained from reality shards.",
  realityShardStatBonus: "Active stat bonus multiplier.",
  fusions: "Total reality shard fusions performed.",
  petSitter: "Active pet sitter entry with pet level, paid coins, and end timestamp.",
  entry: "Entry object detailing pet upgrading start, end, paid coins, and rarity progression.",
  petName: "Name of pet being upgraded.",
  petRarity: "Item rarity string of pet.",
  petLevel: "Current level of pet.",
  paidCoins: "Coins paid to Pet Sitter.",
  paidItems: "Items paid to Pet Sitter.",
  newRarity: "Target upgraded pet rarity.",
  petType: "Pet type identifier.",
  uniquePets: "List of unique pet types unlocked by this member.",
  npcInteractions: "List of unique SkyBlock NPCs spoken to.",
  maxDamage: "Single highest damage hit recorded by this player.",
  maxCritDamage: "Single highest critical hit damage recorded by this player.",
  contacts: "Unlocked Abiphone contacts list.",
  totalDailyQuests: "Cumulative count of completed daily quests.",
  slayerQuest: "Active SlayerQuest object (killedAt, spawnedAt, startedAt, type, tier, target EXP, current EXP, status).",
  slayerData: "SkyBlockSlayerData object (total kills, Zombie/Spider/Wolf kill counts, auto-slayer setting, claimed reward tiers).",
  killedZombieSlayer: "Total Zombie Slayer bosses killed.",
  killedSpiderSlayer: "Total Spider Slayer bosses killed.",
  killedWolfSlayer: "Total Wolf Slayer bosses killed.",
  killedSlayer: "Grand total Slayer bosses killed.",
  autoSlayer: "True if auto-slayer quest restart feature is toggled on.",
  claimedTiers: "Array of Slayer reward tiers claimed.",
  zombieTier: "Highest Zombie Slayer tier defeated.",
  spiderTier: "Highest Spider Slayer tier defeated.",
  wolfTier: "Highest Wolf Slayer tier defeated.",
  unlockedCollectionTiers: "List of collection milestone tiers unlocked by this player.",
  dailyQuestCount: "Count of daily quests completed on current day.",
  dailyQuestDay: "Day counter for daily quest tracking.",
  dailyQuest: "Active DailyQuest object (type, status, start/completion timestamps).",
  newYearCakeBag: "Base64 NBT string of items inside the New Year Cake Bag.",
  claimedNewYearCakes: "Array of New Year Cake year numbers claimed by this member.",
  magicalMushroomSoupTime: "Remaining duration in milliseconds of Magical Mushroom Soup flight effect.",
  pinnedQuest: "Identifier of quest pinned to sidebar scoreboard.",
  quiver: "Base64 NBT string of arrows stored in Quiver.",
  quests: "Map of quest IDs to Quest objects detailing objectives and claimed rewards.",
  kills: "Map of mob entity identifiers to total kill counts.",
  accessoryBag: "Base64 NBT string of accessories stored inside Accessory Bag.",
  skills: "SkyBlockSkills object containing skill cap increases.",
  capIncreases: "Map of skill identifiers to cap increase levels.",
  claimed: "Boolean flag indicating if profile rewards or island claims have been collected.",
  leftAt: "ISO-8601 timestamp string when member left the SkyBlock co-op profile.",
  permissions: "Co-op island permissions map.",
  deaths: "Map of entity/cause identifiers to total death counts.",
  exp: "SkyBlock experience points.",
  level: "SkyBlock level attained.",
  visitedZones: "List of SkyBlock location zones discovered by this player.",
  coinPurse: "Coins held directly in inventory purse.",
  armorContents: "Base64 NBT string of equipped armor items.",
  inventoryContents: "Base64 NBT string of main 36 inventory slot items.",
  enderContents: "Base64 NBT string of Ender Chest items.",
  petInventory: "Base64 NBT string of pets.",
  lastInventoriesSaved: "Unix timestamp in milliseconds when inventories were last saved to database.",
  leaveReason: "Reason why member left profile (KICK, LEAVE, STAFF).",
  joinedAt: "ISO-8601 timestamp string when member joined the co-op.",
  firstJoinedAt: "ISO-8601 timestamp string when member first joined the server.",
  miningMilestone: "Mining milestone level reached.",
  customizedMenu: "Customized SkyBlock menu slot configuration.",
  shinyOrbsUsed: "Number of Shiny Orbs used during anniversary events.",
  shinyPigsCaptured: "Number of Shiny Pigs captured during anniversary events.",
  
  menuBannerQueue: "Queue of MenuBanner objects for the SkyBlock main menu.",
  images: "Map of resolution keys to ImagePair objects (path and type)."
};

document.addEventListener("DOMContentLoaded", () => {
  initDocs();
  setupSearch();
  setupGlobalEvents();
});

async function initDocs() {
  openApiSpec = EMBEDDED_OPENAPI_SPEC;
  renderHeaderVersion();
  renderOverview();
  renderEndpoints();
  renderSchemas();
  renderEnums();

  try {
    const relRes = await fetch("../openapi.json");
    if (relRes.ok) {
      const freshSpec = await relRes.json();
      if (freshSpec && freshSpec.paths) {
        openApiSpec = freshSpec;
        renderHeaderVersion();
        renderOverview();
        renderEndpoints();
        renderSchemas();
        renderEnums();
      }
    }
  } catch (err) {
    // Synchronous embedded spec active
  }

  if (window.location.hash) {
    setTimeout(() => {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
}

function renderHeaderVersion() {
  const versionEl = document.getElementById("api-version");
  if (versionEl && openApiSpec?.info?.version) {
    versionEl.textContent = `${openApiSpec.info.version}`;
  }
}

function renderOverview() {
  const baseEl = document.getElementById("overview-base-url");
  if (baseEl) baseEl.textContent = API_BASE_URL;
}

function renderEndpoints() {
  const container = document.getElementById("endpoints-container");
  const navContainer = document.getElementById("sidebar-endpoints-nav");
  if (!container || !openApiSpec?.paths) return;

  container.innerHTML = "";
  navContainer.innerHTML = "";

  const paths = openApiSpec.paths;
  let endpointIndex = 0;

  for (const [pathUrl, pathItem] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(pathItem)) {
      if (method !== "get" && method !== "post" && method !== "put" && method !== "delete") continue;

      endpointIndex++;
      const endpointId = `ep-${method}-${pathUrl.replace(/[\/\{\}]/g, "-").replace(/--+/g, "-")}`;
      const tag = details.tags?.[0] || "General";
      const summary = details.summary || pathUrl;
      const description = details.description || "";
      const parameters = details.parameters || [];
      const responses = details.responses || {};

      // Sidebar item
      const navItem = document.createElement("li");
      navItem.className = "sidebar-nav-item";
      navItem.innerHTML = `
        <a href="#${endpointId}">
          <span class="method-tag ${method}">${method}</span>
          <span class="sidebar-endpoint-text" title="${summary}">${summary}</span>
        </a>
      `;
      navContainer.appendChild(navItem);

      const guide = ENDPOINT_GUIDES[pathUrl] || {
        howItWorks: "Executes an HTTP GET request to retrieve target resource details from the CraftersMC API.",
        responseBreakdown: "Returns JSON payload object. Status code 200 indicates success.",
        howToDecode: "Standard JSON object parsing.",
        howToImplement: "Use fetch or axios in JavaScript to execute HTTP GET."
      };

      // Endpoint Docs Split Block
      const docBlock = document.createElement("div");
      docBlock.className = "endpoint-docs-block";
      docBlock.id = endpointId;

      const okResponse = responses["200"];
      const okSchemaRef = okResponse?.content?.["application/json"]?.schema?.$ref;
      const resolvedOkSchema = okSchemaRef ? resolveSchemaRef(okSchemaRef) : (okResponse?.content?.["application/json"]?.schema || null);
      const exampleResponseJson = generateSchemaExample(resolvedOkSchema);

      docBlock.innerHTML = `
        <!-- Left Column: Documentation Prose & Parameters -->
        <div class="endpoint-prose-col">
          <div class="endpoint-breadcrumbs">API / ${tag} / ${method.toUpperCase()}</div>
          
          <div class="endpoint-title-row">
            <h3 class="endpoint-heading">${summary}</h3>
          </div>

          <div>
            <span class="method-tag ${method}" style="font-size:0.75rem; padding:3px 8px;">${method}</span>
            <span class="endpoint-path-badge">${pathUrl}</span>
          </div>

          <div class="endpoint-description">${formatDescription(description)}</div>

          <!-- Section 1: How It Works -->
          <div class="doc-guide-section">
            <div class="doc-guide-title">
              <span class="material-icons" style="font-size:1.1rem;">settings</span> 1. How It Works
            </div>
            <div class="doc-guide-content">${guide.howItWorks}</div>
          </div>

          <!-- Section 2: What Is The Response -->
          <div class="doc-guide-section">
            <div class="doc-guide-title">
              <span class="material-icons" style="font-size:1.1rem;">analytics</span> 2. What Is The Response
            </div>
            <div class="doc-guide-content">${guide.responseBreakdown}</div>
          </div>

          <!-- Section 3: How To Decode Data & NBT -->
          <div class="doc-guide-section">
            <div class="doc-guide-title">
              <span class="material-icons" style="font-size:1.1rem;">code</span> 3. How To Decode Data & NBT
            </div>
            <div class="doc-guide-content">${guide.howToDecode}</div>
          </div>

          <!-- Section 4: How To Implement -->
          <div class="doc-guide-section">
            <div class="doc-guide-title">
              <span class="material-icons" style="font-size:1.1rem;">integration_instructions</span> 4. How To Implement
            </div>
            <div class="doc-guide-content">${guide.howToImplement}</div>
          </div>

          <!-- Request Parameters Table -->
          ${renderParametersTable(parameters)}

          <!-- HTTP Status Codes List -->
          <div class="subheading"><span class="material-icons" style="font-size:0.95rem;">import_export</span> HTTP Response Status Codes</div>
          <div class="responses-list">
            ${Object.entries(responses).map(([status, resp]) => `
              <div class="response-item">
                <div class="response-item-header">
                  <span class="status-badge">${status}</span>
                  <span style="font-size:0.85rem; color:var(--text-muted);">${resp.description || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Data Dictionary for Response Fields -->
          ${renderSchemaFieldsBreakdown(resolvedOkSchema)}
        </div>

        <!-- Right Column: Sticky Code Panel -->
        <div class="endpoint-code-col">
          <div class="sticky-code-pane">
            
            <!-- Code Snippet Box -->
            <div class="code-block-wrapper">
              <div class="code-block-header">
                <div class="snippet-tabs">
                  <button class="snippet-btn active" onclick="switchSnippet(this, '${endpointId}-curl')">cURL</button>
                  <button class="snippet-btn" onclick="switchSnippet(this, '${endpointId}-js')">JavaScript</button>
                  <button class="snippet-btn" onclick="switchSnippet(this, '${endpointId}-py')">Python</button>
                </div>
                <button class="btn-copy" onclick="copyToClipboard(this)">Copy</button>
              </div>

              <div id="${endpointId}-curl" class="snippet-content">
                <pre><code>${highlightJson(generateCurlSnippet(method, pathUrl, parameters))}</code></pre>
              </div>
              <div id="${endpointId}-js" class="snippet-content" style="display:none;">
                <pre><code>${highlightJson(generateJsSnippet(method, pathUrl, parameters))}</code></pre>
              </div>
              <div id="${endpointId}-py" class="snippet-content" style="display:none;">
                <pre><code>${highlightJson(generatePySnippet(method, pathUrl, parameters))}</code></pre>
              </div>
            </div>

            <!-- Expected Response Sample JSON -->
            <div class="code-block-wrapper">
              <div class="code-block-header">
                <span>Response Example (200 OK)</span>
                <button class="btn-copy" onclick="copyToClipboard(this)">Copy JSON</button>
              </div>
              <pre><code>${highlightJson(JSON.stringify(exampleResponseJson, null, 2))}</code></pre>
            </div>

          </div>
        </div>
      `;

      container.appendChild(docBlock);
    }
  }
}

function renderParametersTable(parameters) {
  if (!parameters || parameters.length === 0) {
    return `<div style="color:var(--text-dim); font-size:0.84rem; margin-bottom:20px; font-style:italic;">No path or query parameters required for this endpoint.</div>`;
  }

  return `
    <div class="subheading"><span class="material-icons" style="font-size:0.95rem;">tune</span> Input Parameters</div>
    <div class="params-table-wrapper">
      <table class="params-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Location</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description & Constraints</th>
          </tr>
        </thead>
        <tbody>
          ${parameters.map(p => `
            <tr>
              <td><span class="param-name">${p.name}</span></td>
              <td><span class="param-type">${p.in}</span></td>
              <td><span class="param-type">${p.schema?.type || 'string'}${p.schema?.format ? ` (${p.schema.format})` : ''}</span></td>
              <td>${p.required ? '<span class="badge-required">Required</span>' : '<span class="badge-optional">Optional</span>'}</td>
              <td>${p.description || 'No description provided.'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderSchemaFieldsBreakdown(schema) {
  if (!schema || !schema.properties) return '';

  const props = schema.properties;
  const required = schema.required || [];

  return `
    <div style="margin-top:24px;">
      <div class="subheading"><span class="material-icons" style="font-size:0.95rem;">list_alt</span> Response Fields Data Dictionary</div>
      <div class="field-desc-tree">
        ${Object.entries(props).map(([fieldName, propObj]) => {
          const typeStr = getPropTypeString(propObj);
          const isReq = required.includes(fieldName);
          const customDesc = FIELD_DESCRIPTIONS[fieldName] || propObj.description || 'Standard API return field.';

          return `
            <div class="field-item">
              <div class="field-header">
                <div>
                  <span class="field-title">${fieldName}</span>
                  ${isReq ? '<span class="badge-required" style="margin-left:6px;">Required</span>' : ''}
                </div>
                <span class="field-type">${typeStr}</span>
              </div>
              <div class="field-explanation">${customDesc}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function getPropTypeString(prop) {
  if (prop.$ref) return prop.$ref.split('/').pop();
  if (prop.type === 'array') {
    const itemType = prop.items?.$ref ? prop.items.$ref.split('/').pop() : (prop.items?.type || 'object');
    return `array<${itemType}>`;
  }
  if (prop.type) return prop.format ? `${prop.type} (${prop.format})` : prop.type;
  return 'object';
}

function resolveSchemaRef(refStr) {
  if (!refStr || !openApiSpec?.components?.schemas) return null;
  const key = refStr.replace('#/components/schemas/', '');
  return openApiSpec.components.schemas[key] || null;
}

function generateSchemaExample(schema, depth = 0) {
  if (!schema || depth > 4) return "...";

  if (schema.$ref) {
    const resolved = resolveSchemaRef(schema.$ref);
    return generateSchemaExample(resolved, depth + 1);
  }

  if (schema.type === "string") {
    if (schema.enum) return schema.enum[0];
    if (schema.format === "date-time") return "2026-08-29T23:41:00Z";
    return "string";
  }

  if (schema.type === "integer" || schema.type === "number") {
    if (schema.format === "int64") return 1788027112000;
    return 100;
  }

  if (schema.type === "boolean") return true;

  if (schema.type === "array") {
    return [generateSchemaExample(schema.items, depth + 1)];
  }

  if (schema.type === "object" || schema.properties) {
    const obj = {};
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        obj[key] = generateSchemaExample(prop, depth + 1);
      }
    }
    return obj;
  }

  return {};
}

function generateCurlSnippet(method, pathUrl, parameters) {
  let samplePath = pathUrl;
  let queryParams = [];

  parameters.forEach(p => {
    if (p.in === 'path') {
      samplePath = samplePath.replace(`{${p.name}}`, `sample_${p.name}`);
    } else if (p.in === 'query') {
      queryParams.push(`${p.name}=value`);
    }
  });

  const fullUrl = `${API_BASE_URL}${samplePath}${queryParams.length ? '?' + queryParams.join('&') : ''}`;
  return `curl -X ${method.toUpperCase()} "${fullUrl}" \\\n  -H "Accept: application/json"`;
}

function generateJsSnippet(method, pathUrl, parameters) {
  let samplePath = pathUrl;
  let queryParams = [];

  parameters.forEach(p => {
    if (p.in === 'path') {
      samplePath = samplePath.replace(`{${p.name}}`, `sample_${p.name}`);
    } else if (p.in === 'query') {
      queryParams.push(`${p.name}=value`);
    }
  });

  const fullUrl = `${API_BASE_URL}${samplePath}${queryParams.length ? '?' + queryParams.join('&') : ''}`;
  return `const response = await fetch("${fullUrl}", {\n  method: "${method.toUpperCase()}",\n  headers: {\n    "Accept": "application/json"\n  }\n});\nconst data = await response.json();\nconsole.log(data);`;
}

function generatePySnippet(method, pathUrl, parameters) {
  let samplePath = pathUrl;
  let queryParams = [];

  parameters.forEach(p => {
    if (p.in === 'path') {
      samplePath = samplePath.replace(`{${p.name}}`, `sample_${p.name}`);
    } else if (p.in === 'query') {
      queryParams.push(`${p.name}=value`);
    }
  });

  const fullUrl = `${API_BASE_URL}${samplePath}${queryParams.length ? '?' + queryParams.join('&') : ''}`;
  return `import requests\n\nurl = "${fullUrl}"\nheaders = {"Accept": "application/json"}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`;
}

function renderSchemas() {
  const container = document.getElementById("schemas-container");
  const navContainer = document.getElementById("sidebar-schemas-nav");
  if (!container || !openApiSpec?.components?.schemas) return;

  container.innerHTML = "";
  navContainer.innerHTML = "";

  const schemas = openApiSpec.components.schemas;

  for (const [schemaName, schemaObj] of Object.entries(schemas)) {
    if (schemaObj.enum) continue;

    const schemaId = `schema-${schemaName}`;

    const navItem = document.createElement("li");
    navItem.className = "sidebar-nav-item";
    navItem.innerHTML = `<a href="#${schemaId}"><span class="sidebar-endpoint-text">${schemaName}</span></a>`;
    navContainer.appendChild(navItem);

    const card = document.createElement("div");
    card.className = "schema-card";
    card.id = schemaId;

    const sampleObj = generateSchemaExample(schemaObj);

    card.innerHTML = `
      <div class="schema-name">${schemaName}</div>
      <div style="color:var(--text-muted); font-size:0.84rem; margin-bottom:14px;">
        Object Schema ${schemaObj.required ? `(Required fields: <code>${schemaObj.required.join(', ')}</code>)` : ''}
      </div>

      <div class="code-block-wrapper" style="margin-bottom:16px;">
        <div class="code-block-header">
          <span>Schema Model JSON Example</span>
          <button class="btn-copy" onclick="copyToClipboard(this)">Copy</button>
        </div>
        <pre><code>${highlightJson(JSON.stringify(sampleObj, null, 2))}</code></pre>
      </div>

      ${renderSchemaFieldsBreakdown(schemaObj)}
    `;

    container.appendChild(card);
  }
}

function renderEnums() {
  const container = document.getElementById("enums-grid");
  if (!container || !openApiSpec?.components?.schemas) return;

  container.innerHTML = "";
  const schemas = openApiSpec.components.schemas;

  for (const [schemaName, schemaObj] of Object.entries(schemas)) {
    if (!schemaObj.enum) continue;

    const card = document.createElement("div");
    card.className = "enum-card";
    card.innerHTML = `
      <div class="enum-title">${schemaName}</div>
      <div class="enum-values">
        ${schemaObj.enum.map(val => `<span class="enum-pill">${val}</span>`).join('')}
      </div>
    `;
    container.appendChild(card);
  }
}

function formatDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function highlightJson(jsonStr) {
  if (!jsonStr) return "";
  return jsonStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    });
}

function switchSnippet(btn, targetId) {
  const parent = btn.parentElement;
  parent.querySelectorAll(".snippet-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const grandParent = parent.parentElement.parentElement;
  grandParent.querySelectorAll(".snippet-content").forEach(w => w.style.display = "none");

  const target = document.getElementById(targetId);
  if (target) target.style.display = "block";
}

function copyToClipboard(btn) {
  const wrapper = btn.closest(".code-block-wrapper");
  const codeEl = wrapper.querySelector("code");
  const text = codeEl.innerText || codeEl.textContent;

  navigator.clipboard.writeText(text).then(() => {
    const origText = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = origText;
    }, 2000);
  });
}

function setupSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const endpointBlocks = document.querySelectorAll(".endpoint-docs-block");
    const sidebarItems = document.querySelectorAll("#sidebar-endpoints-nav .sidebar-nav-item");

    endpointBlocks.forEach((block, idx) => {
      const text = block.innerText.toLowerCase();
      const match = text.includes(q);
      block.style.display = match ? "grid" : "none";
      if (sidebarItems[idx]) {
        sidebarItems[idx].style.display = match ? "block" : "none";
      }
    });
  });
}

function setupGlobalEvents() {
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 80;
    const items = document.querySelectorAll(".endpoint-docs-block, .schema-card, .doc-section");
    
    items.forEach(item => {
      if (item.offsetTop <= scrollPos && (item.offsetTop + item.offsetHeight) > scrollPos) {
        const id = item.getAttribute("id");
        if (id) {
          document.querySelectorAll(".sidebar-nav-item a").forEach(a => {
            if (a.getAttribute("href") === `#${id}`) {
              a.classList.add("active");
            } else {
              a.classList.remove("active");
            }
          });
        }
      }
    });
  });
}
