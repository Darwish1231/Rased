/**
 * Backend Authentication Guard.
 * Intercepts requests to verify the Firebase ID Token before allowing access.
 */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('--- Incoming Request Logs ---');
    console.log('Path:', request.url);
    console.log('Auth Header Present:', !!authHeader);
    if (authHeader) console.log('Auth Header Format:', authHeader.substring(0, 15) + '...');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('AuthGuard: Missing or invalid Bearer header');
      throw new UnauthorizedException('Access denied! Please log in first.');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      console.log('AuthGuard: Verifying token...');
      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
      request.user = decodedToken;

      // Fetch user profile and role from Firestore and attach to the request object
      const db = this.firebaseService.getFirestore();
      const docRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await docRef.get();
      
      let profileData: any;
      if (userDoc.exists) {
        profileData = userDoc.data();
      } else {
        profileData = { email: decodedToken.email, role: 'user', stationScopes: [] };
      }

      // Automatically promote the site owner's email to 'admin' upon first login
      if (decodedToken.email && decodedToken.email.toLowerCase() === 'admin1@rased.com') {
        if (profileData.role !== 'admin') {
          profileData.role = 'admin';
          await docRef.set(profileData, { merge: true });
          console.log(`User ${decodedToken.email} promoted to admin via AuthGuard! 👑`);
        }
        // Force the role in memory even if DB update is slow or failing
        profileData.role = 'admin';
      }

      request.user.profile = profileData;
      return true;
    } catch (error) {
      console.error('AuthGuard Error:', error.message);
      throw new UnauthorizedException(`Invalid authentication token: ${error.message}`);
    }
  }
}
