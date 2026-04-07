import { Controller, Post, Get, Body, UseGuards, Patch, Param, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
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
  @ApiOperation({ summary: 'إنشاء بلاغ جديد' })
  async createReport(@Body() createReportDto: CreateReportDto, @Req() req: any) {
    const result = await this.reportsService.createReport(createReportDto, req.user);
    return {
      message: 'تم إضافة البلاغ بنجاح',
      data: result,
    };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const urls = files.map(file => `http://localhost:4000/uploads/${file.filename}`);
    return { message: 'تم الرفع', urls };
  }

  @Get()
  @ApiOperation({ summary: 'جلب البلاغات (حسب الصلاحية)' })
  async getReports(@Req() req: any) {
    const reports = await this.reportsService.getAllReports(req.user);
    return {
      message: 'تم جلب البلاغات',
      data: reports,
    };
  }

  @Get(':id')
  async getReportDetails(@Param('id') id: string) {
    const report = await this.reportsService.getReportById(id);
    return {
      message: 'تم جلب البلاغ',
      data: report,
    };
  }

  @Patch(':id/status')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'تحديث حالة البلاغ' })
  @ApiBody({ schema: { example: { status: 'resolved' } } })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const result = await this.reportsService.updateReportStatus(id, status, req.user);
    return result;
  }

  @Patch(':id/assign')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'تعيين البلاغ لمستحدم' })
  @ApiBody({ schema: { example: { assignedToUserId: 'UID' } } })
  async assignReport(@Param('id') id: string, @Body('assignedToUserId') assignedToUserId: string, @Req() req: any) {
    const result = await this.reportsService.assignReport(id, assignedToUserId, req.user);
    return result;
  }

  @Post(':id/comment')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'إضافة تعليق' })
  @ApiBody({ schema: { example: { note: 'تم مراجعة العطل' } } })
  async addComment(@Param('id') id: string, @Body('note') note: string, @Req() req: any) {
    const result = await this.reportsService.addComment(id, note, req.user);
    return result;
  }
}
