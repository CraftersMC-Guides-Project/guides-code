/**
 * Decodes base64-encoded NBT data
 * @param {string} nbtData - Base64 encoded NBT data
 * @returns {Object} Decoded NBT data object
 */
function decodeNBT(nbtData) {
  if (!nbtData || typeof nbtData !== 'string') {
    return null;
  }

  try {
    // Decode base64
    const binaryString = atob(nbtData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Simple NBT parser for common Minecraft item data
    return {
      raw: nbtData,
      decoded: parseNBTBytes(bytes)
    };
  } catch (error) {
    console.error('Error decoding NBT data:', error);
    return {
      raw: nbtData,
      decoded: null,
      error: error.message
    };
  }
}

/**
 * Parses NBT bytes into a readable object
 * @param {Uint8Array} bytes - NBT data bytes
 * @returns {Object} Parsed NBT object
 */
function parseNBTBytes(bytes) {
  const result = {};
  let offset = 0;

  try {
    // Skip compound tag header (0x0a) and string length if present
    if (bytes[0] === 0x0a) {
      offset = 1;
      const nameLen = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
      offset += nameLen;
    }

    // Parse individual tags
    while (offset < bytes.length) {
      const tagType = bytes[offset];
      if (tagType === 0x00) break;

      offset++;

      const keyLen = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
      const keyBytes = bytes.slice(offset, offset + keyLen);
      const key = new TextDecoder().decode(keyBytes);
      offset += keyLen;

      const { value, newOffset } = parseNBTTag(tagType, bytes, offset);
      result[key] = value;
      offset = newOffset;
    }
  } catch (error) {
    console.error('Error parsing NBT bytes:', error);
    result.error = error.message;
  }

  return result;
}

/**
 * Parses a single NBT tag value
 */
function parseNBTTag(tagType, bytes, offset) {
  switch (tagType) {
    case 0x01:
      return { value: bytes[offset], newOffset: offset + 1 };
    case 0x02: {
      const val = (bytes[offset] << 8) | bytes[offset + 1];
      return { value: val, newOffset: offset + 2 };
    }
    case 0x03: {
      const val = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                  (bytes[offset + 2] << 8) | bytes[offset + 3];
      return { value: val, newOffset: offset + 4 };
    }
    case 0x04: {
      const high = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                   (bytes[offset + 2] << 8) | bytes[offset + 3];
      const low = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) |
                  (bytes[offset + 6] << 8) | bytes[offset + 7];
      return { value: high * 0x100000000 + low, newOffset: offset + 8 };
    }
    case 0x08: {
      const len = (bytes[offset] << 8) | bytes[offset + 1];
      const strBytes = bytes.slice(offset + 2, offset + 2 + len);
      const str = new TextDecoder().decode(strBytes);
      return { value: str, newOffset: offset + 2 + len };
    }
    default:
      return { value: null, newOffset: offset + 1 };
  }
}

/**
 * Processes auction data and decrypts NBT information
 */
function processAuctions(auctions) {
  if (!Array.isArray(auctions)) {
    return auctions;
  }

  return auctions.map(auction => {
    const processed = { ...auction };

    // Map field names if they use different formats in the API
    // UUID/ID handling
    if (!processed.uuid && processed.id) {
      processed.uuid = processed.id;
    }
    if (!processed.uuid && processed.auction_id) {
      processed.uuid = processed.auction_id;
    }
    
    // Tier/Rarity handling
    if (!processed.tier && processed.rarity) {
      processed.tier = processed.rarity;
    }
    
    // Bid amount handling
    if (!processed.highest_bid_amount && processed.highest_bid) {
      processed.highest_bid_amount = processed.highest_bid;
    }
    if (!processed.highest_bid_amount && processed.highestBid) {
      processed.highest_bid_amount = processed.highestBid;
    }
    
    // Starting bid handling
    if (!processed.starting_bid && processed.startBid) {
      processed.starting_bid = processed.startBid;
    }
    
    // BIN price handling
    if (!processed.bin_price && processed.binPrice) {
      processed.bin_price = processed.binPrice;
    }
    
    // End time handling
    if (!processed.end_time && processed.endTime) {
      processed.end_time = processed.endTime;
    }
    if (!processed.end_time && processed.ends) {
      processed.end_time = processed.ends;
    }
    
    // Auctioneer/Seller handling
    if (!processed.auctioneer && processed.seller) {
      processed.auctioneer = processed.seller;
    }
    
    // Bid count handling
    if (!processed.bid_count && processed.bids) {
      processed.bid_count = processed.bids;
    }

    if (auction.item_bytes) {
      processed.item_nbt_decoded = decodeNBT(auction.item_bytes);
      
      // Extract item name from decoded NBT data
      if (processed.item_nbt_decoded?.decoded) {
        const decoded = processed.item_nbt_decoded.decoded;
        let itemName = extractItemName(decoded);
        
        if (itemName) {
          processed.item_name = itemName;
          console.log(`[NBT] Extracted item name: ${itemName}`);
        } else {
          console.log(`[NBT] Could not extract item name from:`, decoded);
        }
      }
    }

    if (auction.extra) {
      processed.extra_nbt_decoded = decodeNBT(auction.extra);
    }

    return processed;
  });
}

/**
 * Extract item name from decoded NBT data
 */
function extractItemName(decoded) {
  if (!decoded) return null;
  
  // Try tag.display.Name (Minecraft standard)
  let itemName = decoded?.tag?.display?.Name;
  
  // Try direct display.Name
  if (!itemName) {
    itemName = decoded?.display?.Name;
  }
  
  // Try Name field
  if (!itemName) {
    itemName = decoded?.Name;
  }
  
  // Try id field as fallback
  if (!itemName) {
    itemName = decoded?.id;
  }
  
  // Parse JSON if it's a text component string
  if (itemName && typeof itemName === 'string') {
    // Remove color codes and formatting
    itemName = cleanMCText(itemName);
  }
  
  return itemName || null;
}

/**
 * Clean Minecraft text component/formatting
 */
function cleanMCText(text) {
  if (!text || typeof text !== 'string') return null;
  
  let cleaned = text;
  
  // Try to parse as JSON text component
  if (cleaned.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleaned);
      // Extract text from various formats
      if (parsed.text) {
        cleaned = parsed.text;
      } else if (parsed.extra) {
        // Concatenate extra text components
        cleaned = (parsed.extra || [])
          .map(e => e.text || '')
          .join('');
      }
    } catch (e) {
      // Not valid JSON, keep original
    }
  }
  
  // Remove Minecraft color codes (§c, §6, etc.)
  cleaned = cleaned.replace(/§./g, '');
  
  return cleaned || null;
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const page = params.get('page') || '0';

  try {
    const response = await fetch(
      `https://api.craftersmc.net/v1/skyblock/auctions?page=${page}`,
      {
        headers: {
          'User-Agent': 'Auctions-Tracker/1.0',
          'Accept': 'application/json',
          'x-api-key': env.CMC_API_KEY || env.cmc_api_key || env['cmc-api-key'] || ''
        }
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch auctions',
          status: response.status,
          statusText: response.statusText
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const data = await response.json();

    if (data.auctions && Array.isArray(data.auctions)) {
      data.auctions = processAuctions(data.auctions);
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  } catch (error) {
    console.error('Error in auctions handler:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
