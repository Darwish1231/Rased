"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NotificationManager() {
  useEffect(() => {
    // Only run on client side and if messaging is supported
    if (typeof window === "undefined" || !messaging) return;

    const registerNotifications = async (user: any) => {
      try {
        // 1. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        // 2. Get FCM Token
        // Vapor Key should be your public VAPID key from Firebase Console
        // If not provided, Firebase uses a default one, but for production, you should use yours.
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (token) {
          console.log("FCM Token obtained:", token);
          // 3. Send token to backend
          const idToken = await user.getIdToken();
          await fetch("/api-proxy/users/fcm-token", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({ fcmToken: token })
          });
        }
      } catch (err) {
        console.error("Error setting up notifications:", err);
      }
    };

    // Listening for foreground messages
    const unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // You can show a toast here if you want
      if (typeof window !== "undefined" && payload.notification) {
          const { title, body } = payload.notification;
          new Notification(title || "تنبيه جديد", { body });
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        registerNotifications(user);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessage();
    };
  }, []);

  return null; // This component doesn't render anything UI-wise
}
