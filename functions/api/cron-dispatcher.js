import { getUpcomingEvents } from '../lib/calendar-math.js';
import { sendWebPushNotification } from '../lib/webpush.js';
import { ensureDbSchema } from '../lib/db.js';

export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const isDryRun = url.searchParams.get('dryRun') === 'true';
  const isTest = url.searchParams.get('test') === 'true';
  const isForce = url.searchParams.get('force') === 'true';
  const shouldClearAlerts = url.searchParams.get('clearAlerts') === 'true';
  const isInfo = url.searchParams.get('info') === 'true';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. Quick Info Query for Service Worker background push events
  if (isInfo) {
    const upcoming = getUpcomingEvents();
    const closest = upcoming[0];
    return new Response(JSON.stringify({
      currentEvent: closest ? {
        name: closest.name,
        key: closest.key,
        inMinutes: closest.minutesUntil,
        icon: closest.icon || '/assets/cmc-icon.png'
      } : null,
      upcoming: upcoming.slice(0, 3)
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  // 2. Ensure DB schema exists and auto-migrates missing columns
  if (env.DB) {
    await ensureDbSchema(env.DB);

    // Optional debug cleanup: clear sent alerts history if requested
    if (shouldClearAlerts) {
      try {
        await env.DB.prepare('DELETE FROM fcm_sent_alerts').run();
      } catch (e) {}
    }

    // Auto-clean alerts older than 24 hours to keep D1 tidy
    try {
      await env.DB.prepare("DELETE FROM fcm_sent_alerts WHERE sent_at < datetime('now', '-1 day')").run();
    } catch (e) {}
  }

  const pubKey = env.key_pair_fcm;
  const privKey = env.private_key_fcm;

  // 3. Calculate upcoming SkyBlock events
  const upcomingEvents = getUpcomingEvents();

  // 4. Identify events starting in the 0-6 minute window (or next event if test)
  const activeAlertEvents = isTest
    ? [upcomingEvents[0]] // in test mode, trigger the closest event
    : upcomingEvents.filter(ev => ev.minutesUntil > 0 && ev.minutesUntil <= 6);

  const results = {
    timestamp: new Date().toISOString(),
    dryRun: isDryRun,
    testMode: isTest,
    has_db: !!env.DB,
    has_vapid: !!(pubKey && privKey),
    upcoming: upcomingEvents.map(e => ({ name: e.name, key: e.key, inMinutes: e.minutesUntil })),
    triggered: []
  };

  if (activeAlertEvents.length === 0) {
    results.message = 'No events currently in the 5-minute alert window.';
    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 5. For each active event, check if already alerted & dispatch
  for (const event of activeAlertEvents) {
    const alertId = `${event.key}_${event.nextDay}`;
    const eventSummary = {
      event: event.name,
      alertId: alertId,
      minutesUntil: event.minutesUntil,
      status: 'pending',
      dispatchedCount: 0,
      prunedCount: 0,
      errors: []
    };

    if (env.DB) {
      try {
        // Check if already sent (unless in test or force mode)
        if (!isTest && !isForce) {
          const alreadySent = await env.DB.prepare(
            'SELECT id FROM fcm_sent_alerts WHERE id = ?'
          ).bind(alertId).first();

          if (alreadySent) {
            eventSummary.status = 'already_alerted';
            results.triggered.push(eventSummary);
            continue;
          }
        }
      } catch (dbErr) {
        eventSummary.errors.push(`DB check error: ${dbErr.message}`);
      }
    }

    if (isDryRun) {
      eventSummary.status = 'dry_run_ready';
      results.triggered.push(eventSummary);
      continue;
    }

    // 6. Fetch all subscribers safely with SELECT *
    let subscribers = [];
    if (env.DB) {
      try {
        const queryRes = await env.DB.prepare('SELECT * FROM fcm_subscribers').all();
        subscribers = queryRes.results || [];
      } catch (subErr) {
        eventSummary.errors.push(`Failed to fetch subscribers: ${subErr.message}`);
      }
    }

    // Filter subscribers who have this event enabled
    const eligibleSubscribers = subscribers.filter(sub => {
      try {
        const prefs = JSON.parse(sub.preferences || '{}');
        return prefs[event.key] !== false; // default true if not explicitly false
      } catch (e) {
        return true;
      }
    });

    // 7. Dispatch WebPush to eligible subscribers
    if (!pubKey || !privKey) {
      eventSummary.errors.push('Missing VAPID keys: key_pair_fcm and private_key_fcm must be configured in Cloudflare Pages Environment Variables');
      eventSummary.status = 'missing_vapid_keys';
    } else if (eligibleSubscribers.length === 0) {
      eventSummary.status = 'no_subscribers';
    } else {
      const cleanPubKey = pubKey.replace(/["']/g, '').trim();
      const cleanPrivKey = privKey.replace(/["']/g, '').trim();

      for (const sub of eligibleSubscribers) {
        // Standard WebPush endpoint resolution (Chrome: /wp/<token>, Firefox: /wpush/v2/...)
        const targetEndpoint = sub.endpoint || (sub.token ? `https://fcm.googleapis.com/wp/${sub.token}` : null);
        if (!targetEndpoint) continue;

        try {
          const sendRes = await sendWebPushNotification({
            endpoint: targetEndpoint,
            vapidPublicKey: cleanPubKey,
            vapidPrivateKey: cleanPrivKey,
            subject: 'mailto:alerts@craftersmc-guides.pages.dev'
          });

          if (sendRes.ok) {
            eventSummary.dispatchedCount++;
          } else {
            const shortId = targetEndpoint.slice(-15);
            eventSummary.errors.push(`Endpoint ...${shortId} responded with status ${sendRes.status}`);

            // If subscription is expired or unsubscribed (410 Gone or 404 Not Found), prune it from D1 immediately!
            if ((sendRes.status === 410 || sendRes.status === 404) && env.DB) {
              try {
                await env.DB.prepare(
                  'DELETE FROM fcm_subscribers WHERE token = ? OR endpoint = ?'
                ).bind(sub.token || '', targetEndpoint).run();
                eventSummary.prunedCount++;
                eventSummary.errors.push(`Pruned dead subscriber ...${shortId} from database`);
              } catch (pruneErr) {
                console.warn('[cron-dispatcher] Prune error:', pruneErr.message);
              }
            }
          }
        } catch (pushErr) {
          eventSummary.errors.push(`Push failed: ${pushErr.message}`);
        }
      }
      eventSummary.status = eventSummary.dispatchedCount > 0 ? 'dispatched' : 'dispatch_failed';
    }

    // 8. Record sent alert in D1 ONLY if successfully dispatched
    if (env.DB && !isTest && eventSummary.dispatchedCount > 0) {
      try {
        await env.DB.prepare(`
          INSERT INTO fcm_sent_alerts (id, event_key, event_name)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET sent_at = CURRENT_TIMESTAMP
        `).bind(alertId, event.key, event.name).run();
      } catch (recErr) {
        eventSummary.errors.push(`Failed to record alert: ${recErr.message}`);
      }
    }
    results.triggered.push(eventSummary);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
