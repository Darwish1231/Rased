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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let AuthGuard = class AuthGuard {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Access denied! Please log in first.');
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
            request.user = decodedToken;
            const db = this.firebaseService.getFirestore();
            const docRef = db.collection('users').doc(decodedToken.uid);
            const userDoc = await docRef.get();
            let profileData;
            if (userDoc.exists) {
                profileData = userDoc.data();
            }
            else {
                profileData = { email: decodedToken.email, role: 'user', stationScopes: [] };
            }
            if (decodedToken.email && decodedToken.email.toLowerCase() === 'admin1@rased.com') {
                if (profileData.role !== 'admin') {
                    profileData.role = 'admin';
                    await docRef.set(profileData, { merge: true });
                    console.log(`User ${decodedToken.email} promoted to admin via AuthGuard! 👑`);
                }
                profileData.role = 'admin';
            }
            request.user.profile = profileData;
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Invalid authentication token: ${error.message}`);
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map