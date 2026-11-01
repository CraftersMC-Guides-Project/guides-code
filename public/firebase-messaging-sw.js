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
      {
        action: 'open-calendar',
        title: 'Open Calendar'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(title, notificationOptions);
});

// Fallback listener for raw WebPush or server tickles
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Native push event received');
  if (!event.data) {
    event.waitUntil(
      self.registration.showNotification("🌾 Ethan's Farming Contest Alert!", {
        body: 'A SkyBlock event is starting soon! Click to check the calendar.',
        icon: '/assets/cmc-icon.png',
        badge: '/assets/cmc-icon.png',
        data: { url: '/skycalendar.html' }
      })
    );
    return;
  }

  try {
    const payload = event.data.json();
    // If it's an internal Firebase push message with notification field, Firebase's SDK may show it,
    // but if it's a data payload or custom payload:
    if (payload && (payload.title || payload.notification || payload.data)) {
      const title = payload.notification?.title || payload.data?.title || payload.title || "SkyBlock Event Alert!";
      const body = payload.notification?.body || payload.data?.body || payload.body || "Event starting soon.";
      const icon = payload.notification?.icon || payload.data?.icon || payload.icon || '/assets/cmc-icon.png';
      const targetUrl = payload.data?.url || payload.url || '/skycalendar.html';

      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon,
          badge: '/assets/cmc-icon.png',
          data: { url: targetUrl }
        })
      );
    }
  } catch (err) {
    event.waitUntil(
      self.registration.showNotification("SkyBlock Event Alert!", {
        body: event.data.text() || "Event starting soon.",
        icon: '/assets/cmc-icon.png',
        badge: '/assets/cmc-icon.png',
        data: { url: '/skycalendar.html' }
      })
    );
  }
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
