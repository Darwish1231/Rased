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
          console.log('Firebase: Strategy 1 (Individual Vars) initiated.');
          let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
          privateKey = privateKey.split('\\n').join('\n');
          
          credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID.trim(),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
            privateKey: privateKey,
          });
        } 
        // Priority 2: Full JSON credentials
        else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
          console.log('Firebase: Strategy 2 (Full JSON) initiated.');
          try {
            const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
            if (config.private_key) {
               config.private_key = config.private_key.split('\\n').join('\n');
            }
            credential = admin.credential.cert(config);
          } catch (parseErr) {
            console.error('Firebase: !!! JSON PARSE ERROR !!! Check your Vercel variable syntax.');
            throw parseErr;
          }
        }
        else {
          console.error('Firebase: ERROR - No credentials found in Vercel!');
          console.log('Check: PROJECT_ID=', !!process.env.FIREBASE_PROJECT_ID, ' JSON=', !!process.env.FIREBASE_ADMIN_CREDENTIALS);
          throw new Error('Missing environment variables.');
        }
        
        this.defaultApp = admin.initializeApp({ credential });
        console.log('Firebase Admin Connected Successfully! 🔥');
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

}
