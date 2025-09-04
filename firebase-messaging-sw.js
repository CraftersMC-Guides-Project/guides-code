// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js");

// Same config as in index.html
firebase.initializeApp({
    apiKey: "AIzaSyC9HDieVtkTu_PrSumxoDi1plXduu-J5pg",
    authDomain: "craftersmc-guides.firebaseapp.com",
    projectId: "craftersmc-guides",
    storageBucket: "craftersmc-guides.firebasestorage.app",
    messagingSenderId: "647290515320",
    appId: "1:647290515320:web:44e1be1528c86af00d628d",
    measurementId: "G-K3WGXSF9DQ"
});

// Initialize messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Background message received: ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "./favicon.ico" // optional
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
