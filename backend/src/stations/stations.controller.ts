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
  @ApiOperation({ summary: 'Add a new station', description: 'Available for system administrators only' })
  async createStation(@Body() createStationDto: CreateStationDto) {
    const result = await this.stationsService.createStation(createStationDto);
    return {
      message: 'تم إضافة المحطة بنجاح',
      data: result,
    };
  }

  // Public access to view stations so users can select them during report creation
  @Get()
  @ApiOperation({ summary: 'Retrieve all stations', description: 'Available for all authenticated users' })
  async getStations() {
    const stations = await this.stationsService.getAllStations();
    return {
      message: 'تم جلب المحطات بنجاح',
      data: stations,
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update station details' })
  async updateStation(@Param('id') id: string, @Body() body: any) {
    return this.stationsService.updateStation(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a station' })
  async deleteStation(@Param('id') id: string) {
    return this.stationsService.deleteStation(id);
  }
}
