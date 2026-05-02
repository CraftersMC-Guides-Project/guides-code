function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "x-api-key, content-type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      ...extraHeaders
    }
  });
}

function readExpectedApiKey(env = {}) {
  return (
    env.OLD_HISTORY_API_KEY
  );
}

function isSafeIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z0-9_]+$/.test(value);
}

function pickFirst(columns, candidates) {
  const lower = new Map(columns.map((c) => [String(c).toLowerCase(), c]));
  for (const name of candidates) {
    const hit = lower.get(String(name).toLowerCase());
    if (hit) return hit;
  }
  return null;
}

async function listTables(db) {
  const res = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all();
  return (res?.results || []).map((row) => row.name).filter((name) => typeof name === "string");
}

async function getTableColumns(db, table) {
  const res = await db.prepare(`PRAGMA table_info(${table})`).all();
  return (res?.results || []).map((row) => row.name).filter((name) => typeof name === "string");
}

async function detectBazaarHistoryShape(db) {
  const tables = await listTables(db);
  if (tables.length === 0) return null;

  const ranked = tables
    .map((name) => {
      const lower = name.toLowerCase();
      let score = 0;
      if (lower.includes("bazaar")) score += 3;
      if (lower.includes("price")) score += 2;
      if (lower.includes("history")) score += 2;
      return { name, score };
    })
    .sort((a, b) => b.score - a.score);

  for (const candidate of ranked) {
    const table = candidate.name;
    if (!isSafeIdentifier(table)) continue;

    const columns = await getTableColumns(db, table);
    if (columns.length === 0) continue;

    const itemColumn = pickFirst(columns, ["item_id", "itemid", "itemId", "item", "id"]);
    if (!itemColumn) continue;

    const tsColumn = pickFirst(columns, [
      "timestamp",
      "ts",
      "time",
      "created_at",
      "updated_at",
      "date"
    ]);

    const jsonColumn = pickFirst(columns, ["data", "json", "payload", "value"]);

    return { table, itemColumn, tsColumn, jsonColumn };
  }

  return null;
}

export async function onRequest({ request, env, params }) {
  if (request.method === "OPTIONS") return json({ ok: true }, 204);
  if (request.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405);

  const expectedKey = readExpectedApiKey(env);
  if (!expectedKey) return json({ ok: false, error: "Missing API key secret (OLD_HISTORY_API_KEY)" }, 500);

  const providedKey = request.headers.get("x-api-key") || request.headers.get("X-API-Key");
  if (!providedKey || providedKey !== expectedKey) {
    return json({ ok: false, error: "Unauthorized" }, 401, { "Cache-Control": "no-store" });
  }

  const db = env.DB;
  if (!db) return json({ ok: false, error: "Missing D1 binding (DB)" }, 500);

  const itemId = String(params?.itemid || "").trim().toLowerCase();
  if (!itemId) return json({ ok: false, error: "Missing itemid param" }, 400);

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.max(1, Math.min(5000, Number(limitRaw || 500))) || 500;

  try {
    const table = env.BAZAAR_PRICES_TABLE || env.BAZAAR_HISTORY_TABLE || null;
    const itemColumn = env.BAZAAR_ITEM_COLUMN || null;
    const tsColumn = env.BAZAAR_TS_COLUMN || null;
    const jsonColumn = env.BAZAAR_DATA_COLUMN || null;

    let shape = null;
    if (table) {
      if (!isSafeIdentifier(table)) return json({ ok: false, error: "Invalid BAZAAR_* table name" }, 500);
      shape = {
        table,
        itemColumn: itemColumn || "item_id",
        tsColumn: tsColumn || null,
        jsonColumn: jsonColumn || null
      };
    } else {
      shape = await detectBazaarHistoryShape(db);
    }

    if (!shape) {
      const tables = await listTables(db);
      return json(
        {
          ok: false,
          error: "Could not detect bazaar prices table",
          hint:
            "Set env vars: BAZAAR_PRICES_TABLE (and optionally BAZAAR_ITEM_COLUMN/BAZAAR_TS_COLUMN/BAZAAR_DATA_COLUMN).",
          tables
        },
        500
      );
    }

    const safeTable = shape.table;
    const safeItemColumn = shape.itemColumn;
    const safeTsColumn = shape.tsColumn;
    const safeJsonColumn = shape.jsonColumn;

    if (![safeTable, safeItemColumn, safeTsColumn, safeJsonColumn].filter(Boolean).every(isSafeIdentifier)) {
      return json({ ok: false, error: "Invalid detected schema identifiers" }, 500);
    }

    const selectCols = [];
    if (safeTsColumn) selectCols.push(safeTsColumn);
    if (safeJsonColumn) selectCols.push(safeJsonColumn);
    if (selectCols.length === 0) selectCols.push("*");

    const orderBy = safeTsColumn ? ` ORDER BY ${safeTsColumn} DESC` : "";
    const sql = `SELECT ${selectCols.join(", ")} FROM ${safeTable} WHERE ${safeItemColumn} = ?${orderBy} LIMIT ?`;
    const res = await db.prepare(sql).bind(itemId, limit).all();

    const rows = Array.isArray(res?.results) ? res.results : [];
    const parsedRows = safeJsonColumn
      ? rows.map((row) => {
          const raw = row?.[safeJsonColumn];
          if (typeof raw !== "string") return row;
          try {
            return { ...row, [safeJsonColumn]: JSON.parse(raw) };
          } catch {
            return row;
          }
        })
      : rows;

    return json(
      {
        ok: true,
        itemId,
        source: "d1",
        table: safeTable,
        count: parsedRows.length,
        rows: parsedRows
      },
      200,
      { "Cache-Control": "no-store" }
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: "Failed to fetch bazaar prices",
        detail: error?.message || String(error)
      },
      500
    );
  }
}

