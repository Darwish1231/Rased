import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Fetch user profile data from Firestore.
   */
  async getUserById(uid: string) {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    
    const data = doc.data() || {};
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin1@rased.com';
    if (data.email && data.email.toLowerCase() === bootstrapEmail.toLowerCase() && data.role !== 'admin') {
      await docRef.update({ role: 'admin' });
      data.role = 'admin';
      console.log(`User ${data.email} promoted to admin automatically via bootstrap! 👑`);
    }
    
    return { id: doc.id, ...data };
  }

  /**
   * Create a new user profile upon registration.
   */
  async createUserProfile(uid: string, data: any) {
    const db = this.firebaseService.getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    const newProfile = {
      fullName: data.fullName || 'New User',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'user', // admin, supervisor, user
      stationScopes: data.stationScopes || [],
      createdAt: new Date().toISOString()
    };
    
    await userRef.set(newProfile);
    return { id: uid, ...newProfile };
  }

  /**
   * Retrieve all user profiles (Administrative access only).
   */
  async getAllUsers() {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Update user roles and station scopes (Role promotion).
   */
  async updateUserRole(uid: string, role: string, stationScopes: string[] = []) {
    const db = this.firebaseService.getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    await userRef.update({
      role,
      stationScopes
    });
    
    return { message: 'تم تحديث صلاحية المستخدم بنجاح' };
  }

  /**
   * Update the FCM token for push notifications.
   */
  async updateFcmToken(uid: string, fcmToken: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('users').doc(uid).update({ fcmToken });
    return { message: 'تم تحديث توكن الإشعارات بنجاح' };
  }

  /**
   * Delete a user permanently from Firebase Auth and Firestore.
   */
  async deleteUser(uid: string) {
    const db = this.firebaseService.getFirestore();
    const auth = this.firebaseService.getAuth();
    
    // 1. Delete from Firebase Auth
    try {
      await auth.deleteUser(uid);
    } catch (err) {
      console.error(`Auth deletion failed for ${uid}:`, err.message);
      // Even if auth fails (e.g. user already deleted from auth), we might want to continue deleting from firestore
    }

    // 2. Delete from Firestore
    await db.collection('users').doc(uid).delete();
    
    return { message: 'تم حذف المستخدم نهائياً' };
  }
}
