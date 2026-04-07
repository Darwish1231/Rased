/**
 * ملف التشغيل الرئيسي (Main Entry Point).
 * يقوم بتهيئة خادم NestJS وفتح المنفذ (4000) لاستقبال الطلبات.
 * وتفعيل إعدادات الـ CORS والسماح بالملفات الكبيرة.
 */
/**
 * هذا الملف هو "نقطة البداية" (Entry point) اللي بيقوم بتشغيل خادم الـ Backend كله.
 * هنا بنحدد بورت التشغيل وكمان فعلنا (CORS) عشان الموقع (Frontend) يقدر يكلم الخادم بدون مشاكل أمنية.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // تفعيل السماح للـ Frontend إنه يكلم الـ Backend
  app.enableCors();
  
  // زيادة مساحة استيعاب البيانات للسماح باستقبال الصور بصيغة النصوص (Base64)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // السماح بقراءة المرفقات من مجلد المرفقات
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Rased Platform API')
    .setDescription('مستندات دوال نظام راصد لإدارة بلاغات المحطات')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
