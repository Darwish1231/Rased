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
          vapidKey: "BJqYbDSfg6344ofy_9rsZLgbYh3E9s7bWEMoIEghxov7aas4ENV048rYgQbwfBAZdXnAhei1Vje3rFP4Xm8XlT0"
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
