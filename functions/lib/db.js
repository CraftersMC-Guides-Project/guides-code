/**
 * CraftersMC Database Schema Manager for Cloudflare D1
 * Automatically manages table creation and self-healing column migrations.
 */

export async function ensureDbSchema(db) {
  if (!db) return;

  try {
    // 1. Ensure base table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS fcm_subscribers (
        token TEXT PRIMARY KEY,
        preferences TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 2. Check existing columns dynamically
    const tableInfo = await db.prepare("PRAGMA table_info(fcm_subscribers)").all();
    const existingColumns = (tableInfo.results || []).map(c => c.name);

    // 3. Add any missing columns safely
    if (!existingColumns.includes('endpoint')) {
      try {
        await db.prepare("ALTER TABLE fcm_subscribers ADD COLUMN endpoint TEXT").run();
      } catch (e) {}
    }
    if (!existingColumns.includes('p256dh')) {
      try {
        await db.prepare("ALTER TABLE fcm_subscribers ADD COLUMN p256dh TEXT").run();
      } catch (e) {}
    }
    if (!existingColumns.includes('auth')) {
      try {
        await db.prepare("ALTER TABLE fcm_subscribers ADD COLUMN auth TEXT").run();
      } catch (e) {}
    }
    if (!existingColumns.includes('device_id')) {
      try {
        await db.prepare("ALTER TABLE fcm_subscribers ADD COLUMN device_id TEXT").run();
      } catch (e) {}
    }

    try {
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_fcm_device_id ON fcm_subscribers(device_id)").run();
    } catch (e) {}

    // 4. Ensure sent alerts log table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS fcm_sent_alerts (
        id TEXT PRIMARY KEY,
        event_key TEXT,
        event_name TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.warn('[D1 Schema] ensureDbSchema warning:', err.message);
  }
}

