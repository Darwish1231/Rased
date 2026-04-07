/**
 * المتحكم الرئيسي (App Controller).
 * بيعمل اختبار بسيط جداً لمعرفة حالة السيرفر (Health Check) عن طريق مسار '/' الأساسي.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
