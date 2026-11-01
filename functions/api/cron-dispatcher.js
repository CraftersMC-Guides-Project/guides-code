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
        crops: closest.crops || [],
        icon: closest.icon || (closest.key === 'farming' ? '/assets/farming/Farm-o-Matic.webp' : '/assets/cmc-icon.png')
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

  // 4. Identify events in the 15-minute or 5-minute alert windows
  const candidates = [];
  if (isTest) {
    // In test mode, evaluate the closest upcoming event
    const testEv = upcomingEvents[0];
    candidates.push({
      event: testEv,
      stage: '5',
      leadMinutes: 5
    });
  } else {
    for (const ev of upcomingEvents) {
      // 15-minute alert window (11 to 16 minutes away)
      if (ev.minutesUntil >= 11 && ev.minutesUntil <= 16) {
        candidates.push({
          event: ev,
          stage: '15',
          leadMinutes: 15
        });
      }
      // 5-minute alert window (1 to 6 minutes away)
      if (ev.minutesUntil >= 1 && ev.minutesUntil <= 6) {
        candidates.push({
          event: ev,
          stage: '5',
          leadMinutes: 5
        });
      }
    }
  }

  const results = {
    timestamp: new Date().toISOString(),
    dryRun: isDryRun,
    testMode: isTest,
    has_db: !!env.DB,
    has_vapid: !!(pubKey && privKey),
    upcoming: upcomingEvents.map(e => ({
      name: e.name,
      key: e.key,
      inMinutes: e.minutesUntil,
      crops: e.crops || undefined
    })),
    triggered: []
  };

  if (candidates.length === 0) {
    results.message = 'No events currently in the 15-minute or 5-minute alert windows.';
    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // 5. For each candidate, check if already alerted & dispatch
  for (const candidate of candidates) {
    const { event, stage, leadMinutes } = candidate;
    const alertId = `${event.key}_${event.nextDay}_${stage}m`;
    const eventSummary = {
      event: event.name,
      stage: `${stage}m`,
      alertId: alertId,
      minutesUntil: event.minutesUntil,
      crops: event.crops || [],
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

    // Filter subscribers who have this event enabled AND match timing & crop filters
    const eligibleSubscribers = subscribers.filter(sub => {
      try {
        const prefs = JSON.parse(sub.preferences || '{}');

        // 1. Is the event enabled? (default true)
        if (prefs[event.key] === false) return false;

        // 2. Lead time check: default { '5': true, '15': false } if not configured
        const leadPrefs = prefs.lead_time || { '5': true, '15': false };
        if (!leadPrefs[stage]) return false;

        // 3. Farming crop check: if event is farming, check crop filter
        if (event.key === 'farming' && event.crops && Array.isArray(event.crops)) {
          const userCrops = prefs.farming_crops;
          // If user specifically filtered crops (non-empty and not all 10), contest MUST have at least one chosen crop
          if (Array.isArray(userCrops)) {
            if (userCrops.length === 0) return false; // user disabled all crops
            if (userCrops.length < 10) {
              const hasMatchingCrop = event.crops.some(c => userCrops.includes(c));
              if (!hasMatchingCrop) return false;
            }
          }
        }

        return true;
      } catch (e) {
        return true;
      }
    });

    // 7. Dispatch WebPush to eligible subscribers
    if (!pubKey || !privKey) {
      eventSummary.errors.push('Missing VAPID keys: key_pair_fcm and private_key_fcm must be configured in Cloudflare Pages Environment Variables');
      eventSummary.status = 'missing_vapid_keys';
    } else if (eligibleSubscribers.length === 0) {
      eventSummary.status = 'no_eligible_subscribers';
    } else {
      const cleanPubKey = pubKey.replace(/["']/g, '').trim();
      const cleanPrivKey = privKey.replace(/["']/g, '').trim();

      for (const sub of eligibleSubscribers) {
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

            // If subscription is expired or unsubscribed (410 Gone or 404 Not Found), prune immediately!
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
