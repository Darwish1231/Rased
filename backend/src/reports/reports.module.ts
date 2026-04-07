/**
 * هذا الملف هو الموديول (Module) اللي بيجمع ملفات البلاغات كلها مع بعض.
 * بيعرّف النظام إن الـ ReportsController والـ ReportsService جزء من حزمة واحدة اسمها Reports.
 */
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
