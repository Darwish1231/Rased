/**
 * Firebase Service Initialization.
 * This file establishes a secure connection to Google's Firebase Admin SDK.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private defaultApp: admin.app.App;

  onModuleInit() {
    console.log('--- Firebase Initialization Start ---');
    if (!admin.apps.length) {
      try {
        let credential;
        
        // Priority 1: Individual environment variables (preferred for Vercel deployment)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          console.log('Firebase: Initializing with individual environment variables');
          let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
          
          // CRITICAL FIX: Ensure ALL escaped newlines are converted to actual newlines
          // This handles keys pasted as a single line with \n characters
          privateKey = privateKey.split('\\n').join('\n');
          
          // Also handle cases where the key might have been pasted with literal newlines but missing the header/footer breaks
          if (!privateKey.includes('\n')) {
             console.log('Firebase: Fixing flat private key format...');
             privateKey = privateKey
               .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
               .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
          }
          
          credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID.trim(),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
            privateKey: privateKey,
          });
        } 
        // Priority 2: Full minified JSON credentials string
        else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
          console.log('Firebase: Initializing with FIREBASE_ADMIN_CREDENTIALS JSON');
          const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
          if (config.private_key) {
            config.private_key = config.private_key.replace(/\\n/g, '\n');
          }
          credential = admin.credential.cert(config);
        } else {
          // Fallback: Local development service account file
          console.log('Firebase: Attempting to use local service account file...');
          const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
          credential = admin.credential.cert(require(serviceAccountPath));
        }
        
        this.defaultApp = admin.initializeApp({ credential });
        console.log('Firebase Admin Connected Successfully! 🔥 Project ID:', process.env.FIREBASE_PROJECT_ID || 'JSON_USED');
      } catch (error) {
        console.error('Firebase Initialization ERROR:', error.message);
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
      }
    } else {
      this.defaultApp = admin.app();
    }
  }

  getAuth() {
    return this.defaultApp.auth();
  }

  getFirestore() {
    return this.defaultApp.firestore();
  }

  getMessaging() {
    return this.defaultApp.messaging();
  }
}
