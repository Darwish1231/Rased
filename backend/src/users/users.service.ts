import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * جلب بيانات المستخدم من Firestore
   */
  async getUserById(uid: string) {
    const db = this.firebaseService.getFirestore();
    const docRef = db.collection('users').doc(uid);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    
    const data = doc.data() || {};
    // ترقية تلقائية للإيميل الخاص بصاحب الموقع ليكون الأدمن بمجرد تسجيل دخوله
    if (data.email && data.email.toLowerCase() === 'admin1@rased.com' && data.role !== 'admin') {
      await docRef.update({ role: 'admin' });
      data.role = 'admin';
      console.log('User admin1@rased.com promoted to admin automatically! 👑');
    }
    
    return { id: doc.id, ...data };
  }

  /**
   * إنشاء مستخدم جديد (عند التسجيل لأول مرة)
   */
  async createUserProfile(uid: string, data: any) {
    const db = this.firebaseService.getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    const newProfile = {
      fullName: data.fullName || 'مستخدم جديد',
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
   * جلب جميع المستخدمين (للأدمن)
   */
  async getAllUsers() {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * تعديل صلاحيات المستخدم (مثلاً ترقيته لمشرف)
   */
  async updateUserRole(uid: string, role: string, stationScopes: string[] = []) {
    const db = this.firebaseService.getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    await userRef.update({
      role,
      stationScopes
    });
    
    return { message: 'تم تحديث الصلاحيات بنجاح' };
  }
}
