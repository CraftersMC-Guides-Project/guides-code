import { getUpcomingEvents } from '../lib/calendar-math.js';
import { sendWebPushNotification } from '../lib/webpush.js';

export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const isDryRun = url.searchParams.get('dryRun') === 'true';
  const isTest = url.searchParams.get('test') === 'true';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const pubKey = env.key_pair_fcm;
  const privKey = env.private_key_fcm;

  // 1. Calculate upcoming SkyBlock events
  const upcomingEvents = getUpcomingEvents();

  // 2. Identify events starting in the 0-6 minute window
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

  // 3. For each active event, check if already alerted & dispatch
  for (const event of activeAlertEvents) {
    const alertId = `${event.key}_${event.nextDay}`;
    const eventSummary = {
      event: event.name,
      alertId: alertId,
      minutesUntil: event.minutesUntil,
      status: 'pending',
      dispatchedCount: 0,
      errors: []
    };

    if (env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS fcm_sent_alerts (
            id TEXT PRIMARY KEY,
            event_key TEXT,
            event_name TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        // Check if already sent (unless in test mode)
        if (!isTest) {
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

    // 4. Fetch subscribers for this event
    let subscribers = [];
    if (env.DB) {
      try {
        const queryRes = await env.DB.prepare(
          'SELECT token, endpoint, p256dh, auth, preferences FROM fcm_subscribers WHERE endpoint IS NOT NULL'
        ).all();
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

    // 5. Dispatch WebPush to eligible subscribers
    if (pubKey && privKey && eligibleSubscribers.length > 0) {
      const cleanPubKey = pubKey.replace(/["']/g, '').trim();
      const cleanPrivKey = privKey.replace(/["']/g, '').trim();

      for (const sub of eligibleSubscribers) {
        try {
          const sendRes = await sendWebPushNotification({
            endpoint: sub.endpoint,
            vapidPublicKey: cleanPubKey,
            vapidPrivateKey: cleanPrivKey,
            subject: 'mailto:alerts@craftersmc-guides.pages.dev'
          });

          if (sendRes.ok) {
            eventSummary.dispatchedCount++;
          } else {
            eventSummary.errors.push(`Endpoint ${sub.endpoint.slice(-12)} responded with ${sendRes.status}`);
          }
        } catch (pushErr) {
          eventSummary.errors.push(`Push failed: ${pushErr.message}`);
        }
      }
    }

    // 6. Record sent alert in D1
    if (env.DB && !isTest) {
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

    eventSummary.status = 'dispatched';
    results.triggered.push(eventSummary);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

