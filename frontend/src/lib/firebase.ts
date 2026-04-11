/**
 * Firebase Configuration and Initialization.
 * Initializes Firebase Auth, Firestore, and Storage using environment variables.
 * Exports the initialized instances for use across the application.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "367332219760",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized already (important for Next.js SSR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Messaging only on the client side
let messaging: Messaging | undefined;
if (typeof window !== "undefined") {
  try {
     messaging = getMessaging(app);
  } catch (err) {
    // This can happen in local development or if Firebase Messaging is not supported
    console.warn("Firebase Messaging not supported in this environment");
  }
}

export { app, auth, db, storage, messaging };
