/**
 * الخدمة الرئيسية (App Service).
 * بترد برسالة "Hello World" البسيطة للتأكد إن الخادم قام بنجاح.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Rased API Version 5.2 - Live';
  }
}
