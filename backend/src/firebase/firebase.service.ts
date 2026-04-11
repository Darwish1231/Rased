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
        
        // Priority 1: Individual environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          console.log('Firebase: Initializing with individual environment variables');
          let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
          privateKey = privateKey.split('\\n').join('\n');
          
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
        // Priority 2: Full JSON credentials
        else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
          console.log('Firebase: Initializing with FIREBASE_ADMIN_CREDENTIALS JSON');
          const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
          if (config.private_key) {
            config.private_key = config.private_key.split('\\n').join('\n');
          }
          credential = admin.credential.cert(config);
        }
        else {
          console.error('Firebase: ERROR - Missing Environment Variables!');
          console.log('PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
          console.log('PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
          console.log('CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
          console.log('ADMIN_CREDENTIALS:', !!process.env.FIREBASE_ADMIN_CREDENTIALS);
          throw new Error('Firebase configuration missing in Vercel settings.');
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
