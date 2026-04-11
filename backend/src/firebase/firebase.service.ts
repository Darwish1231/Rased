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
    if (!admin.apps.length) {
      try {
        let credential;
        
        // Priority 1: Individual environment variables (preferred for Vercel deployment)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
          
          // Clean and handle newline characters in the private key
          privateKey = privateKey.replace(/\\n/g, '\n');
          if (!privateKey.includes('\n')) {
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
          const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
          if (config.private_key) {
            config.private_key = config.private_key.replace(/\\n/g, '\n');
          }
          credential = admin.credential.cert(config);
        } else {
          // Fallback: Local development service account file
          const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
          credential = admin.credential.cert(require(serviceAccountPath));
        }
        
        this.defaultApp = admin.initializeApp({ credential });
        console.log('Firebase Admin Connected Successfully! 🔥');
      } catch (error) {
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
