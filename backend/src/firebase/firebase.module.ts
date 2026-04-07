/**
 * هذا الملف هو "الموديول" الخاص بالفايربيس.
 * في NestJS، الموديول هو زي صندوق بيجمع كل حاجة تخص الفايربيس (زي الـ Service اللي عملناه)
 * وبنصدره عشان نقدر نستخدمه في أي مسار تاني في المشروع زي استقبال البلاغات.
 */
import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global() // خليناه جلوبال يعني عام، عشان يكون متاح في كل التطبيق من غير ما نطلبه مخصوص
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
