// Corrected service worker code for firebase-messaging-sw.js
try {
  importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js');

  // Initialize Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyC9HDieVtkTu_PrSumxoDi1plXduu-J5pg",
    projectId: "craftersmc-guides",
    messagingSenderId: "647290515320",
    appId: "1:647290515320:web:44e1be1528c86af00d628d"
  });

  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon.png' // optional
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  console.log('Firebase Messaging Service Worker loaded successfully');
} catch (e) {
  console.error('Error in service worker:', e);
}