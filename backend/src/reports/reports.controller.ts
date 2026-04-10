import { Controller, Post, Get, Body, UseGuards, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident report' })
  async createReport(@Body() createReportDto: CreateReportDto, @Req() req: any) {
    const result = await this.reportsService.createReport(createReportDto, req.user);
    return {
      message: 'Report created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve reports based on user permissions' })
  async getReports(@Req() req: any) {
    const reports = await this.reportsService.getAllReports(req.user);
    return {
      message: 'Reports retrieved successfully',
      data: reports,
    };
  }

  @Get(':id')
  async getReportDetails(@Param('id') id: string) {
    const report = await this.reportsService.getReportById(id);
    return {
      message: 'Report details retrieved successfully',
      data: report,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report details (by reporter)' })
  async updateReport(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    const result = await this.reportsService.updateReport(id, updateData, req.user);
    return result;
  }

  @Patch(':id/status')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Update the status of a report' })
  @ApiBody({ schema: { example: { status: 'resolved' } } })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const result = await this.reportsService.updateReportStatus(id, status, req.user);
    return result;
  }

  @Patch(':id/assign')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Assign a report to a user' })
  @ApiBody({ schema: { example: { assignedToUserId: 'UID' } } })
  async assignReport(@Param('id') id: string, @Body('assignedToUserId') assignedToUserId: string, @Req() req: any) {
    const result = await this.reportsService.assignReport(id, assignedToUserId, req.user);
    return result;
  }

  @Post(':id/comment')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Add a comment to a report' })
  @ApiBody({ schema: { example: { note: 'Issue has been reviewed' } } })
  async addComment(@Param('id') id: string, @Body('note') note: string, @Req() req: any) {
    const result = await this.reportsService.addComment(id, note, req.user);
    return result;
  }
}
