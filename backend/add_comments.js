const fs = require('fs');
const path = require('path');

const comments = {
  'src/main.ts': `/**\n * ملف التشغيل الرئيسي (Main Entry Point).\n * يقوم بتهيئة خادم NestJS وفتح المنفذ (4000) لاستقبال الطلبات.\n * وتفعيل إعدادات الـ CORS والسماح بالملفات الكبيرة.\n */\n`,
  'src/app.module.ts': `/**\n * الموديول الرئيسي (App Module) للـ Backend.\n * هذا الملف يقوم بجمع وتربيط كل الموديولات الأخرى (محطات، بلاغات، أمان) لتكوين الخادم.\n */\n`,
  'src/auth/auth.guard.ts': `/**\n * الحارس الأمني (Auth Guard) الخاص بالـ Backend.\n * وظيفته اعتراض أي طلب والتأكد من وجود تذكرة دخول (Firebase Token) صحيحة قبل السماح بالوصول.\n */\n`,
  'src/stations/stations.controller.ts': `/**\n * وحدة تحكم المحطات (Stations Controller).\n * يستقبل طلبات إضافة محطات جديدة وجلب قائمة المحطات لعرضها في الموقع (بوابة مرور).\n */\n`,
  'src/stations/stations.service.ts': `/**\n * خدمة المحطات (Stations Service) - محرك الداتا.\n * هذا الملف يحتوي على الأكواد المسؤولة عن التواصل مع قاعدة بيانات Firebase بشكل مباشر لجلب المحطات.\n */\n`,
  'src/reports/reports.controller.ts': `/**\n * وحدة تحكم البلاغات (Reports Controller).\n * يستقبل البلاغات الجديدة، وينظم طلبات تغيير حالة البلاغ والتأكد من بيانات المستخدم.\n */\n`,
  'src/reports/reports.service.ts': `/**\n * خدمة البلاغات (Reports Service) - محرك الداتا.\n * يتولى هذا الملف حفظ البلاغات وتحديث حالتها مباشرة من وإلى قاعدة بيانات Firestore بصلاحيات الأدمن.\n */\n`,
  'src/firebase/firebase.service.ts': `/**\n * تهيئة اتصال قاعدة البيانات (Firebase Service).\n * هذا الملف يقوم بالاتصال بسيرفرات جوجل (Firebase Admin SDK) وفتح قناة آمنة لقاعدة البيانات.\n */\n`,
  'seed.js': `/**\n * سكربت التمهيد والحقن (Seed Script).\n * يُستخدم لمرة واحدة لضخ محطات كهربائية حقيقية داخل قاعدة البيانات لتمهيد النظام وبيئة العمل.\n */\n`,
};

let updated = 0;
for (const [file, comment] of Object.entries(comments)) {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // إزالة التعليقات القديمة إن وجدت بالمصادفة عشان نكتب الموحد
    if (content.trim().startsWith('/**')) {
      content = content.replace(/\/\*\*[\s\S]*?\*\/\n/, '');
    }
    fs.writeFileSync(p, comment + content.trimStart());
    updated++;
  }
}
console.log(`Updated ${updated} files with Arabic comments!`);
