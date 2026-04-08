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
    // التأكد إنه لم يتم التهيئة من قبل
    if (!admin.apps.length) {
      let credential;
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
        // إصلاح مشكلة التفاف الأسطر في المفتاح الخاص التي تحدث غالباً في Vercel
        if (config.private_key) {
          config.private_key = config.private_key.replace(/\\n/g, '\n');
        }
        credential = admin.credential.cert(config);
      } else {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
        credential = admin.credential.cert(require(serviceAccountPath));
      }
      
      // تسجيل الدخول لقاعدة البيانات كأدمن
      this.defaultApp = admin.initializeApp({ credential });
      console.log('Firebase Admin Connected Successfully! 🔥');
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
