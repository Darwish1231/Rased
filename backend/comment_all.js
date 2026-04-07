const fs = require('fs');
const path = require('path');

const comments = {
  // Frontend
  'frontend/src/app/dashboard/layout.tsx': `/**\n * هيكل لوحة التحكم (Dashboard Layout).\n * هذا الملف يمثل الغلاف الخارجي لكل شاشات لوحة التحكم، ويحتوي على الشريط العلوي (Navbar).\n * كما يتولى مهمة طرد أي شخص يحاول الدخول للوحة التحكم بدون تسجيل الدخول وتوجيهه لصفحة الدخول.\n */\n`,
  'frontend/src/app/login/page.tsx': `/**\n * شاشة تسجيل الدخول (Login Page).\n * الواجهة اللي بيدخل منها المستخدم إيميله وباسورده عشان يدخل للوحة التحكم.\n * بتتواصل مباشرة مع (Firebase Auth) وبتجيب التذكرة الأمنية.\n */\n`,
  'frontend/src/app/register/page.tsx': `/**\n * شاشة إنشاء الحساب (Register Page).\n * الواجهة المسؤولة عن تسجيل أشخاص جدد في النظام وإنشاء حساباتهم في فايربيس.\n */\n`,
  'frontend/src/app/layout.tsx': `/**\n * الهيكل الرئيسي للمشروع باكمله (Root Layout).\n * هذا الملف يغلف كل صفحات الموقع، ويحتوي على إعدادات الخطوط (Fonts) والتنسيقات الأساسية.\n */\n`,
  'frontend/src/app/page.tsx': `/**\n * الصفحة الرئيسية الافتتاحية للموقع (Landing Page).\n * شاشة الترحيب اللي بتظهر أول ما تفتح الموقع، وبترشدك لصفحة تسجيل الدخول.\n */\n`,
  'frontend/src/lib/firebase.ts': `/**\n * ملف محرك فايربيس للمتصفح (Firebase Client Setup).\n * بيحتوي على المفاتيح السرية وبيأسس الاتصال بقاعدة البيانات وخدمة التوثيق عشان الفرونت إند يعرف يكلم فايربيس.\n */\n`,

  // Backend - Modules and Controllers left
  'backend/src/reports/reports.module.ts': `/**\n * حزمة البلاغات (Reports Module).\n * هو صندوق بيضم الكنترولر والسيرفيس بتوع البلاغات عشان النيست (NestJS) يعترف بيهم ويشغلهم.\n */\n`,
  'backend/src/stations/stations.module.ts': `/**\n * حزمة المحطات (Stations Module).\n * يضم الكنترولر والسيرفيس المسؤولين عن تشغيل مسارات وأوامر المحطات.\n */\n`,
  'backend/src/app.controller.ts': `/**\n * المتحكم الرئيسي (App Controller).\n * بيعمل اختبار بسيط جداً لمعرفة حالة السيرفر (Health Check) عن طريق مسار '/' الأساسي.\n */\n`,
  'backend/src/app.service.ts': `/**\n * الخدمة الرئيسية (App Service).\n * بترد برسالة "Hello World" البسيطة للتأكد إن الخادم قام بنجاح.\n */\n`
};

let updated = 0;
for (const [file, comment] of Object.entries(comments)) {
  const p = path.join(__dirname, '..', file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.trim().startsWith('/**')) {
      fs.writeFileSync(p, comment + content.trimStart());
      updated++;
    }
  } else {
    console.log("Not found:", p);
  }
}
console.log(`Successfully added educational Arabic comments to ${updated} files!`);
