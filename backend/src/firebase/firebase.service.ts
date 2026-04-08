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
      let credential;
      
      // الأولوية للمتغيرات المنفصلة (أسهل في Vercel وتمنع أخطاء التنسيق)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        // تنظيف المفتاح من أي علامات اقتباس زائدة أو فراغات في البداية والنهاية
        privateKey = privateKey.trim().replace(/^"/, '').replace(/"$/, '');
        // تحويل الـ \n النصية إلى أسطر حقيقية
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        });
        console.log('Firebase Init: Using individual ENV variables ✅');
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
