import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ReportsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Logs a new event for a specific report in the report_events collection.
   */
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

  /**
   * Creates a new incident report in the Firestore database.
   */
  async createReport(reportData: any, user: any) {
    const db = this.firebaseService.getFirestore();
    
    const newReport = {
      reporterId: user.uid,
      stationId: reportData.stationId || '',
      stationNumber: reportData.stationNumber || '',
      description: reportData.description || '',
      category: reportData.category || 'other',
      severity: reportData.severity || 'low',
      media: reportData.media || [],
      location: reportData.location || { lat: 0, lng: 0 },
      status: 'new', // Available statuses: new, in_review, assigned, resolved
      assignedToUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('reports').add(newReport);
    
    // Log the creation event
    await this.logReportEvent({
      reportId: docRef.id,
      action: 'create',
      actorId: user.uid,
      toStatus: 'new'
    });

    return { id: docRef.id, ...newReport };
  }

  /**
   * Retrieves reports based on user role and permissions.
   * - Admins see all reports.
   * - Supervisors see reports within their station scope.
   * - Regular users see only their own reports.
   */
  async getAllReports(user: any) {
    const db = this.firebaseService.getFirestore();
    const profile = user.profile;
    const role = profile?.role || 'user';
    
    let snapshot;
    const reportsRef = db.collection('reports');

    if (role === 'admin') {
      // Admins have access to all reports
      snapshot = await reportsRef.get();
    } else if (role === 'supervisor') {
      // Supervisors only see reports within their defined scope
      const scopes = profile.stationScopes || [];
      if (scopes.length > 0) {
        // Firebase `in` query limits arrays to 10 limits, but for MVP it's acceptable.
        snapshot = await reportsRef.where('stationId', 'in', scopes).get();
      } else {
        return []; // Return empty if no scope is defined
      }
    } else {
      // Regular users only see their own submitted reports
      snapshot = await reportsRef.where('reporterId', '==', user.uid).get();
    }
    
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort reports by creation date (newest first)
    docs.sort((a: any, b: any) => {
       const tA = new Date(a.createdAt).getTime();
       const tB = new Date(b.createdAt).getTime();
       return tB - tA;
    });

    return docs;
  }

  /**
   * Retrieves a single report by ID along with its event history.
   */
  async getReportById(id: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('reports').doc(id).get();
    
    if (!doc.exists) {
      throw new NotFoundException('Report not found');
    }
    
    // Fetch associated report events
    const eventsSnapshot = await db.collection('report_events')
      .where('reportId', '==', id)
      .get();
      
    const events = eventsSnapshot.docs.map(e => ({ id: e.id, ...e.data() }));
    // Sort events by date (oldest to newest)
    events.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { id: doc.id, ...doc.data(), events };
  }

  /**
   * Updates the status of an existing report and logs the change.
   */
  async updateReportStatus(id: string, status: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const reportRef = db.collection('reports').doc(id);
    
    const doc = await reportRef.get();
    if (!doc.exists) throw new NotFoundException('Report not found');
    
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

    return { message: 'Status updated successfully', id, status };
  }

  /**
   * Assigns a report to a specific user and updates the status to 'assigned'.
   */
  async assignReport(id: string, assignedToUserId: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const reportRef = db.collection('reports').doc(id);
    
    const doc = await reportRef.get();
    if (!doc.exists) throw new NotFoundException('Report not found');

    await reportRef.update({
      assignedToUserId,
      status: 'assigned', // Assignment typically changes status to assigned
      updatedAt: new Date().toISOString(),
    });

    await this.logReportEvent({
      reportId: id,
      action: 'assignment',
      actorId: user.uid,
      toStatus: 'assigned',
      note: `Assigned to user ${assignedToUserId}`
    });

    return { message: 'Report assigned successfully' };
  }

  /**
   * Adds a comment/note to a report's history.
   */
  async addComment(id: string, note: string, user: any) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('reports').doc(id).get();
    if (!doc.exists) throw new NotFoundException('Report not found');

    await this.logReportEvent({
      reportId: id,
      action: 'comment',
      actorId: user.uid,
      note: note
    });

    return { message: 'Comment added successfully' };
  }
}
