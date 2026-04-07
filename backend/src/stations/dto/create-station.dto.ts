import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsEnum, IsOptional } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'ST-01', description: 'رقم المحطة التعريفي' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'محطة كهرباء المعادي', description: 'اسم المحطة' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'South Cairo', description: 'المنطقة الجغرافية' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: { lat: 30.123, lng: 31.456 }, description: 'إحداثيات المحطة' })
  @IsObject()
  @IsNotEmpty()
  location: { lat: number; lng: number };

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], description: 'حالة المحطة', required: false })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
