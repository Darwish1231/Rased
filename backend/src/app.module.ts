/**
 * الموديول الرئيسي (App Module) للـ Backend.
 * هذا الملف يقوم بجمع وتربيط كل الموديولات الأخرى (محطات، بلاغات، أمان) لتكوين الخادم.
 */
/**
 * هذا الملف هو "الموديول الرئيسي" للـ Backend.
 * بنجمع فيه كل الموديولات الفرعية بتاعتنا (زي موديول الفايربيس وموديول البلاغات) 
 * عشان يشتغلوا مع بعض كسيستم واحد.
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { ReportsModule } from './reports/reports.module';
import { StationsModule } from './stations/stations.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [FirebaseModule, ReportsModule, StationsModule, UsersModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
