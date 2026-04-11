// Scripts for firebase syntax
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// These credentials will be populated by the browser during the first registration
// since it shares the same origin as the main app.
firebase.initializeApp({
  messagingSenderId: "148386187790" // This will be automatically handled if using default web setup
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Ensure you have a logo.png in public for better UX
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
