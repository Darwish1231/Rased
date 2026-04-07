"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let ReportsService = class ReportsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async logReportEvent(data) {
        const db = this.firebaseService.getFirestore();
        const event = {
            ...data,
            createdAt: new Date().toISOString()
        };
        await db.collection('report_events').add(event);
    }
    async createReport(reportData, user) {
        const db = this.firebaseService.getFirestore();
        const newReport = {
            reporterId: user.uid,
            stationId: reportData.stationId || '',
            stationNumber: reportData.stationNumber || '',
            description: reportData.description || '',
            category: reportData.category || 'غيره',
            severity: reportData.severity || 'low',
            media: reportData.media || [],
            location: reportData.location || { lat: 0, lng: 0 },
            status: 'new',
            assignedToUserId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const docRef = await db.collection('reports').add(newReport);
        await this.logReportEvent({
            reportId: docRef.id,
            action: 'create',
            actorId: user.uid,
            toStatus: 'new'
        });
        return { id: docRef.id, ...newReport };
    }
    async getAllReports(user) {
        const db = this.firebaseService.getFirestore();
        const profile = user.profile;
        const role = profile?.role || 'user';
        let snapshot;
        const reportsRef = db.collection('reports');
        if (role === 'admin') {
            snapshot = await reportsRef.get();
        }
        else if (role === 'supervisor') {
            const scopes = profile.stationScopes || [];
            if (scopes.length > 0) {
                snapshot = await reportsRef.where('stationId', 'in', scopes).get();
            }
            else {
                return [];
            }
        }
        else {
            snapshot = await reportsRef.where('reporterId', '==', user.uid).get();
        }
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs.sort((a, b) => {
            const tA = new Date(a.createdAt).getTime();
            const tB = new Date(b.createdAt).getTime();
            return tB - tA;
        });
        return docs;
    }
    async getReportById(id) {
        const db = this.firebaseService.getFirestore();
        const doc = await db.collection('reports').doc(id).get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('البلاغ غير موجود');
        }
        const eventsSnapshot = await db.collection('report_events')
            .where('reportId', '==', id)
            .get();
        const events = eventsSnapshot.docs.map(e => ({ id: e.id, ...e.data() }));
        events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return { id: doc.id, ...doc.data(), events };
    }
    async updateReportStatus(id, status, user) {
        const db = this.firebaseService.getFirestore();
        const reportRef = db.collection('reports').doc(id);
        const doc = await reportRef.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('البلاغ غير موجود');
        const oldStatus = doc.data()?.status;
        await reportRef.update({
            status: status,
            updatedAt: new Date().toISOString(),
        });
        await this.logReportEvent({
            reportId: id,
            action: 'status_change',
            actorId: user.uid,
            fromStatus: oldStatus,
            toStatus: status
        });
        return { message: 'تم تحديث الحالة', id, status };
    }
    async assignReport(id, assignedToUserId, user) {
        const db = this.firebaseService.getFirestore();
        const reportRef = db.collection('reports').doc(id);
        const doc = await reportRef.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('البلاغ غير موجود');
        await reportRef.update({
            assignedToUserId,
            status: 'assigned',
            updatedAt: new Date().toISOString(),
        });
        await this.logReportEvent({
            reportId: id,
            action: 'assignment',
            actorId: user.uid,
            toStatus: 'assigned',
            note: `تم التعيين إلى المستخدم ${assignedToUserId}`
        });
        return { message: 'تم تعيين البلاغ بنجاح' };
    }
    async addComment(id, note, user) {
        const db = this.firebaseService.getFirestore();
        const doc = await db.collection('reports').doc(id).get();
        if (!doc.exists)
            throw new common_1.NotFoundException('البلاغ غير موجود');
        await this.logReportEvent({
            reportId: id,
            action: 'comment',
            actorId: user.uid,
            note: note
        });
        return { message: 'تم إضافة التعليق بنجاح' };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map