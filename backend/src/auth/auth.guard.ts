/**
 * الحارس الأمني (Auth Guard) الخاص بالـ Backend.
 * وظيفته اعتراض أي طلب والتأكد من وجود تذكرة دخول (Firebase Token) صحيحة قبل السماح بالوصول.
 */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('طلبك مرفوض! يجب تسجيل الدخول وإرفاق التذكرة الأمنية أولاً.');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Firebase هيفك التذكرة ويتأكد من توقيعها وإنها لسه صالحة
      const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
      request.user = decodedToken;

      // جلب بيانات الحساب والدور (Role) من قاعدة البيانات وربطه بالطلب المبعوث
      const db = this.firebaseService.getFirestore();
      const docRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await docRef.get();
      
      let profileData: any;
      if (userDoc.exists) {
        profileData = userDoc.data();
      } else {
        profileData = { email: decodedToken.email, role: 'user', stationScopes: [] };
      }

      // ترقية تلقائية للإيميل الخاص بصاحب الموقع ليكون الأدمن بمجرد تسجيل دخوله
      if (decodedToken.email && decodedToken.email.toLowerCase() === 'admin1@rased.com' && profileData.role !== 'admin') {
        profileData.role = 'admin';
        await docRef.set(profileData, { merge: true });
        console.log(`User ${decodedToken.email} promoted to admin via AuthGuard! 👑`);
      }

      request.user.profile = profileData;
      return true;
    } catch (error) {
      throw new UnauthorizedException('تذكرة الدخول (Token) غير صالحة أو منتهية الصلاحية.');
    }
  }
}
