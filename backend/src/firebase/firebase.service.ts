/**
 * تهيئة اتصال قاعدة البيانات (Firebase Service).
 * هذا الملف يقوم بالاتصال بسيرفرات جوجل (Firebase Admin SDK) وفتح قناة آمنة لقاعدة البيانات.
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
        
        // الأولوية للمتغيرات المنفصلة (أسهل في Vercel وتمنع أخطاء التنسيق)
      if (process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_CLIENT_EMAIL) {
        const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
        
        if (!projectId || !clientEmail || !privateKey) {
          const missing: string[] = [];
          if (!projectId) missing.push('FIREBASE_PROJECT_ID');
          if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
          if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
          throw new Error(`Missing Environment Variables in Vercel: ${missing.join(', ')}`);
        }
        
        // تنظيف شامل للمفتاح
        privateKey = privateKey.replace(/\\n/g, '\n');
        privateKey = privateKey.split('\n').map(line => line.trim()).filter(line => line).join('\n');
        // تأكيد وجود الشرطات
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        }
        
        credential = admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        });
        console.log('Firebase Init: Final-Stage Sanitize Applied ✅');
      } 
        // البديل: ملف الـ JSON الكامل
        else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
          const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
          if (config.private_key) {
            config.private_key = config.private_key.replace(/\\n/g, '\n');
          }
          credential = admin.credential.cert(config);
          console.log('Firebase Init: Using JSON string ✅');
        } else {
          const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
          credential = admin.credential.cert(require(serviceAccountPath));
          console.log('Firebase Init: Using local file 🏠');
        }
        
        this.defaultApp = admin.initializeApp({ credential });
        console.log('Firebase Admin Connected Successfully! 🔥');
      } catch (error) {
        const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
        const startHex = Buffer.from(rawKey.substring(0, 5)).toString('hex');
        const endHex = Buffer.from(rawKey.slice(-5)).toString('hex');
        const snippet = `Len: ${rawKey.length}, StartHex: ${startHex}, EndHex: ${endHex}, Start: ${rawKey.substring(0, 15)}...`;
        throw new Error(`Failed to initialize Firebase: ${error.message} (Debug Info: ${snippet})`);
      }
    } else {
      this.defaultApp = admin.app();
    }
  }

  // دالة لنجيب منها نظام المصادقة
  getAuth() {
    return this.defaultApp.auth();
  }

  // دالة لنجيب منها قاعدة البيانات (الجداول)
  getFirestore() {
    return this.defaultApp.firestore();
  }
}
