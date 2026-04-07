/**
 * الموديول الخاص بالمحطات (Stations Module).
 * بيجمع كل خدمات المحطات عشان الخادم يتعرف عليها بسهولة.
 */
import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';

@Module({
  controllers: [StationsController],
  providers: [StationsService],
})
export class StationsModule {}
