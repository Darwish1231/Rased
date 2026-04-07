import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(createReportDto: CreateReportDto, req: any): Promise<{
        message: string;
        data: {
            reporterId: any;
            stationId: any;
            stationNumber: any;
            description: any;
            category: any;
            severity: any;
            media: any;
            location: any;
            status: string;
            assignedToUserId: null;
            createdAt: string;
            updatedAt: string;
            id: string;
        };
    }>;
    uploadFiles(files: Array<Express.Multer.File>): Promise<{
        message: string;
        urls: string[];
    }>;
    getReports(req: any): Promise<{
        message: string;
        data: any;
    }>;
    getReportDetails(id: string): Promise<{
        message: string;
        data: {
            events: {
                id: string;
            }[];
            id: string;
        };
    }>;
    updateStatus(id: string, status: string, req: any): Promise<{
        message: string;
        id: string;
        status: string;
    }>;
    assignReport(id: string, assignedToUserId: string, req: any): Promise<{
        message: string;
    }>;
    addComment(id: string, note: string, req: any): Promise<{
        message: string;
    }>;
}
