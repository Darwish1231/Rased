"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NotificationManager() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const registerNotifications = async (user: any) => {
      try {
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: "BKeN5D636e0536XGZlY5m0u3nQv86V5Y_2_XjI1_XW_2_XjI1_XW_2_XjI1_XW_2_XjI1_XW_2_XjI1_XW_2_XjI1" // This is a standard VAPID key placeholder or use yours
        });

        if (token) {
          console.log("FCM Token:", token);
          // Send token to backend
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

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          if (payload.notification) {
            const { title, body } = payload.notification;
            new Notification(title || "تنبيه جديد", { body });
          }
        });

      } catch (err) {
        console.error("Error setting up notifications:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        registerNotifications(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // This component doesn't render anything
}
