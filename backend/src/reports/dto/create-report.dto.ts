import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsArray, IsOptional } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'ST-001_ID', description: 'معرف المحطة' })
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @ApiProperty({ example: 'محطة كهرباء المعادي', description: 'رقم/اسم المحطة', required: false })
  @IsString()
  @IsOptional()
  stationNumber?: string;

  @ApiProperty({ example: 'عطل كهربائي', description: 'تصنيف العطل' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'high', description: 'مستوى الخطورة' })
  @IsString()
  @IsNotEmpty()
  severity: string;

  @ApiProperty({ example: 'انقطاع تام في المحول الرئيسي', description: 'وصف العطل' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: { lat: 30.12, lng: 31.44 }, description: 'الموقع الجغرافي للعطل' })
  @IsObject()
  @IsNotEmpty()
  location: any;

  @ApiProperty({ example: ['http://link-to-img.com/img.png'], description: 'روابط المرفقات', required: false })
  @IsArray()
  @IsOptional()
  media?: string[];
}
