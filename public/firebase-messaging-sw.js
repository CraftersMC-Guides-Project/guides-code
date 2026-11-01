/**
 * CraftersMC Guides — Firebase Cloud Messaging Service Worker
 * Handles background push notifications for SkyBlock Calendar events.
 */

importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker context
firebase.initializeApp({
  apiKey: "AIzaSyAn7vfm3mQb1PR0ppAyBj_5dRsngCAlXnk",
  authDomain: "craftersmc-guides-cab30.firebaseapp.com",
  projectId: "craftersmc-guides-cab30",
  storageBucket: "craftersmc-guides-cab30.firebasestorage.app",
  messagingSenderId: "924655326351",
  appId: "1:924655326351:web:bf07720a8f5787aec04cfa"
});

const messaging = firebase.messaging();

// Handle incoming background messages from Firebase SDK
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received Firebase background message:', payload);

  const title = payload.notification?.title || payload.data?.title || "🌾 Ethan's Farming Contest Alert!";
  const body = payload.notification?.body || payload.data?.body || 'A scheduled SkyBlock event is starting soon. Check the calendar!';
  const icon = payload.notification?.icon || payload.data?.icon || '/assets/cmc-icon.png';
  const tag = payload.data?.tag || payload.notification?.tag || 'skycalendar-event';
  const targetUrl = payload.data?.url || '/skycalendar.html';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: '/assets/cmc-icon.png',
    tag: tag,
    vibrate: [200, 100, 200],
    data: {
      url: targetUrl,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open-calendar', title: 'Open Calendar' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(title, notificationOptions).catch(err => {
    console.warn('[SW] showNotification rejected by OS:', err.message);
  });
});

// Primary & Fallback listener for raw WebPush or server tickles
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Native push event received');

  let title = "🌾 SkyBlock Event Alert!";
  let body = "A scheduled SkyBlock event is starting soon. Check the calendar!";
  let icon = "/assets/cmc-icon.png";
  let targetUrl = "/skycalendar.html";

  // Check if push event brought payload data
  let hasPayload = false;
  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload && (payload.title || payload.notification || payload.data)) {
        title = payload.notification?.title || payload.data?.title || payload.title || title;
        body = payload.notification?.body || payload.data?.body || payload.body || body;
        icon = payload.notification?.icon || payload.data?.icon || payload.icon || icon;
        targetUrl = payload.data?.url || payload.url || targetUrl;
        hasPayload = true;
      }
    } catch (e) {
      const rawText = event.data.text();
      if (rawText) {
        body = rawText;
        hasPayload = true;
      }
    }
  }

  // If no payload was delivered (standard WebPush tickle), query the live alert API
  const handlePush = async () => {
    if (!hasPayload) {
      try {
        const response = await fetch('/api/cron-dispatcher?info=true', { cache: 'no-store' });
        if (response.ok) {
          const info = await response.json();
          if (info && info.currentEvent) {
            const ev = info.currentEvent;
            title = `🔔 ${ev.name} Alert!`;
            let cropInfo = '';
            if (ev.crops && ev.crops.length > 0) {
              const formattedCrops = ev.crops.map(c => c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')).join(', ');
              cropInfo = ` Contested crops: ${formattedCrops}.`;
            }
            body = `Starting in ${ev.inMinutes} minute${ev.inMinutes === 1 ? '' : 's'}!${cropInfo}`;
            if (ev.icon) icon = ev.icon;
          }
        }
      } catch (err) {
        console.warn('[firebase-messaging-sw.js] Failed to fetch active event info:', err);
      }
    }

    return self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: '/assets/cmc-icon.png',
      tag: 'skycalendar-event-alert',
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: targetUrl,
        timestamp: Date.now()
      },
      actions: [
        { action: 'open-calendar', title: 'Open Calendar' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }).catch(err => {
      console.warn('[firebase-messaging-sw.js] OS-level notification blocked:', err.message);
    });
  };

  event.waitUntil(handlePush());
});

// Handle user clicking on a push notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/skycalendar.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open with the calendar, focus it
      for (const client of windowClients) {
        if (client.url.includes('skycalendar.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window to the destination
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
