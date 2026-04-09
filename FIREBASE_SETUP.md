# Firebase Setup Guide for Rased Platform

Follow these steps to configure the Firebase project for both Frontend and Backend.

## 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `Rased-Platform`.
3. (Optional) Enable Google Analytics.

## 2. Authentication Setup
1. In the left menu, go to **Build > Authentication**.
2. Click **Get Started**.
3. Enable **Email/Password** as a sign-in provider.

## 3. Firestore Database Setup
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select a location (e.g., `europe-west3`).
4. Start in **Production Mode** or **Test Mode** (ensure rules allow authenticated access).
5. Add the following collections:
   - `users`
   - `reports`
   - `report_events`
   - `stations`

## 4. Frontend Configuration (Web SDK)
1. Go to **Project Settings** (gear icon).
2. Under **Your apps**, click the **Web icon (`</>`)**.
3. Register the app as `rased-web`.
4. Copy the `firebaseConfig` object values into `frontend/.env`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   # ...etc
   ```

## 5. Backend Configuration (Service Account)
1. Go to **Project Settings > Service Accounts**.
2. Click **Generate New Private Key**.
3. This will download a `.json` file.
4. Open the file and copy the following into `backend/.env`:
   - `FIREBASE_PROJECT_ID` -> `project_id`
   - `FIREBASE_CLIENT_EMAIL` -> `client_email`
   - `FIREBASE_PRIVATE_KEY` -> `private_key` (Ensure it starts with `-----BEGIN PRIVATE KEY-----`)

   **Alternatively**, you can stringify the whole JSON and put it in `FIREBASE_ADMIN_CREDENTIALS`.
