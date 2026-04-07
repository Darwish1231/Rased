import { FirebaseService } from '../firebase/firebase.service';
export declare class ReportsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    private logReportEvent;
    createReport(reportData: any, user: any): Promise<{
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
    }>;
    getAllReports(user: any): Promise<any>;
    getReportById(id: string): Promise<{
        events: {
            id: string;
        }[];
        id: string;
    }>;
    updateReportStatus(id: string, status: string, user: any): Promise<{
        message: string;
        id: string;
        status: string;
    }>;
    assignReport(id: string, assignedToUserId: string, user: any): Promise<{
        message: string;
    }>;
    addComment(id: string, note: string, user: any): Promise<{
        message: string;
    }>;
}
