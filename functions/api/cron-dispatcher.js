import { getUpcomingEvents } from '../lib/calendar-math.js';
import { sendWebPushNotification } from '../lib/webpush.js';
import { ensureDbSchema } from '../lib/db.js';

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

  // 1. Ensure DB schema exists and auto-migrates missing columns
  if (env.DB) {
    await ensureDbSchema(env.DB);
  }

  const pubKey = env.key_pair_fcm;
  const privKey = env.private_key_fcm;

  // 2. Calculate upcoming SkyBlock events
  const upcomingEvents = getUpcomingEvents();

  // 3. Identify events starting in the 0-6 minute window (or next event if test)
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

  // 4. For each active event, check if already alerted & dispatch
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

    // 5. Fetch all subscribers safely with SELECT *
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

    // 6. Dispatch WebPush to eligible subscribers
    if (pubKey && privKey && eligibleSubscribers.length > 0) {
      const cleanPubKey = pubKey.replace(/["']/g, '').trim();
      const cleanPrivKey = privKey.replace(/["']/g, '').trim();

      for (const sub of eligibleSubscribers) {
        // Resolve push endpoint (fallback to Google FCM endpoint if subscriber only had token)
        const targetEndpoint = sub.endpoint || (sub.token ? `https://fcm.googleapis.com/fcm/send/${sub.token}` : null);
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
            eventSummary.errors.push(`Endpoint ${targetEndpoint.slice(-15)} responded with status ${sendRes.status}`);
          }
        } catch (pushErr) {
          eventSummary.errors.push(`Push failed: ${pushErr.message}`);
        }
      }
    }

    // 7. Record sent alert in D1 to prevent repeat spam
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
