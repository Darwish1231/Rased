import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ReportsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // إضافة Event جديد في الـ Log
  private async logReportEvent(data: {
    reportId: string;
    action: 'status_change' | 'comment' | 'assignment' | 'create';
    actorId: string;
    fromStatus?: string;
    toStatus?: string;
    note?: string;
  }) {
    const db = this.firebaseService.getFirestore();
    const event = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await db.collection('report_events').add(event);
  }

  // إضافة بلاغ جديد
  async createReport(reportData: any, user: any) {
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
      status: 'new', // new, in_review, assigned, resolved, rejected
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('reports').add(newReport);
    
    // تسجيل حركة الإنشاء
    await this.logReportEvent({
      reportId: docRef.id,
      action: 'create',
      actorId: user.uid,
      toStatus: 'new'
    });

    return { id: docRef.id, ...newReport };
  }

  // جلب البلاغات (حسب الدور)
  async getAllReports(user: any) {
    const db = this.firebaseService.getFirestore();
    const profile = user.profile;
    const role = profile?.role || 'user';
    
    let snapshot;
    const reportsRef = db.collection('reports');

    if (role === 'admin') {
      // الأدمن يشوف كله
      snapshot = await reportsRef.get();
    } else if (role === 'supervisor') {
      // المشرف يشوف المحطات اللي في نطاقه بس
      const scopes = profile.stationScopes || [];
      if (scopes.length > 0) {
        // Firebase `in` query limits arrays to 10 limits, but for MVP it's acceptable.
        snapshot = await reportsRef.where('stationId', 'in', scopes).get();
      } else {
        return []; // لو معندوش محطات هنرجع مصفوفة فاضية
      }
    } else {
      // المستخدم العادي يشوف بلاغاته
      snapshot = await reportsRef.where('reporterId', '==', user.uid).get();
    }
    
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // الترتيب الأحدث أولا
    docs.sort((a: any, b: any) => {
       const tA = new Date(a.createdAt).getTime();
       const tB = new Date(b.createdAt).getTime();
       return tB - tA;
    });

    return docs;
  }

  async getReportById(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('reports').doc(id).get();
    
    if (!doc.exists) {
      throw new NotFoundException('البلاغ غير موجود');
    }
    
    // نجيب معاها أحداث البلاغ
    const eventsSnapshot = await db.collection('report_events')
      .where('reportId', '==', id)
      .get();
      
    const events = eventsSnapshot.docs.map(e => ({ id: e.id, ...e.data() }));
    // نرتب الأحداث قديم لجديد
    events.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { id: doc.id, ...doc.data(), events };
  }

  // تغيير الحالة
  async updateReportStatus(id: string, status: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const reportRef = db.collection('reports').doc(id);
    
    const doc = await reportRef.get();
    if (!doc.exists) throw new NotFoundException('البلاغ غير موجود');
    
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

  // تعيين البلاغ
  async assignReport(id: string, assignedToUserId: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const reportRef = db.collection('reports').doc(id);
    
    const doc = await reportRef.get();
    if (!doc.exists) throw new NotFoundException('البلاغ غير موجود');

    await reportRef.update({
      assignedToUserId,
      status: 'assigned', // غالباً التعيين بيقلب الحالة
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

  // إضافة تعليق
  async addComment(id: string, note: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('reports').doc(id).get();
    if (!doc.exists) throw new NotFoundException('البلاغ غير موجود');

    await this.logReportEvent({
      reportId: id,
      action: 'comment',
      actorId: user.uid,
      note: note
    });

    return { message: 'تم إضافة التعليق بنجاح' };
  }
}
