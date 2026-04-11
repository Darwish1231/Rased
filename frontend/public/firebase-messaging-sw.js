importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// These are public config values, same as in your client-side firebase.ts
firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "rased-pi.firebaseapp.com",
  projectId: "rased-pi",
  storageBucket: "rased-pi.firebasestorage.app",
  messagingSenderId: "367332219760",
  appId: "1:367332219760:web:421cd7a1f592cd2d1265b7",
});

const messaging = firebase.messaging();

// Customize background message handling here if needed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Make sure you have this icon or change path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
