import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateStationDto } from './dto/create-station.dto';

@ApiTags('Stations')
@ApiBearerAuth()
@Controller('stations')
@UseGuards(AuthGuard, RolesGuard)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'إضافة محطة جديدة', description: 'متاح فقط لمدير النظام' })
  async createStation(@Body() createStationDto: CreateStationDto) {
    const result = await this.stationsService.createStation(createStationDto);
    return {
      message: 'تم إضافة المحطة بنجاح',
      data: result,
    };
  }

  // مسموح للكل يشوف المحطات (عشان الـ User يقدر يختار المحطة وهو بيعمل بلاغ)
  @Get()
  @ApiOperation({ summary: 'جلب جميع المحطات', description: 'متاح للجميع' })
  async getStations() {
    const stations = await this.stationsService.getAllStations();
    return {
      message: 'تم جلب المحطات بنجاح',
      data: stations,
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'تعديل بيانات الحطة' })
  async updateStation(@Param('id') id: string, @Body() body: any) {
    return this.stationsService.updateStation(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'حذف محطة' })
  async deleteStation(@Param('id') id: string) {
    return this.stationsService.deleteStation(id);
  }
}
