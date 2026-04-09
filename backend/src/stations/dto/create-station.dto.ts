import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsEnum, IsOptional } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'ST-01', description: 'Station identification number' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Maadi Power Station', description: 'Name of the station' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'South Cairo', description: 'Geographical region' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: { lat: 30.123, lng: 31.456 }, description: 'Geographical coordinates' })
  @IsObject()
  @IsNotEmpty()
  location: { lat: number; lng: number };

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], description: 'Station operational status', required: false })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
