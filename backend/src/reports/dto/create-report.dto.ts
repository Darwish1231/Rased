import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsArray, IsOptional } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'ST-001_ID', description: 'Station unique identifier' })
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @ApiProperty({ example: 'Maadi Power Station', description: 'Station name or number', required: false })
  @IsString()
  @IsOptional()
  stationNumber?: string;

  @ApiProperty({ example: 'Electrical Fault', description: 'Fault category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'high', description: 'Severity level (low, medium, high)' })
  @IsString()
  @IsNotEmpty()
  severity: string;

  @ApiProperty({ example: 'Complete blackout in the main transformer', description: 'Detailed description of the fault' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: { lat: 30.12, lng: 31.44 }, description: 'Geographical coordinates of the incident' })
  @IsObject()
  @IsNotEmpty()
  location: any;

  @ApiProperty({ example: ['http://link-to-img.com/img.png'], description: 'Array of attachment URLs', required: false })
  @IsArray()
  @IsOptional()
  media?: string[];
}
