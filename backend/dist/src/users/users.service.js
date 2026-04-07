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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let UsersService = class UsersService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getUserById(uid) {
        const db = this.firebaseService.getFirestore();
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        return { id: doc.id, ...doc.data() };
    }
    async createUserProfile(uid, data) {
        const db = this.firebaseService.getFirestore();
        const userRef = db.collection('users').doc(uid);
        const newProfile = {
            fullName: data.fullName || 'مستخدم جديد',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'user',
            stationScopes: data.stationScopes || [],
            createdAt: new Date().toISOString()
        };
        await userRef.set(newProfile);
        return { id: uid, ...newProfile };
    }
    async getAllUsers() {
        const db = this.firebaseService.getFirestore();
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async updateUserRole(uid, role, stationScopes = []) {
        const db = this.firebaseService.getFirestore();
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            role,
            stationScopes
        });
        return { message: 'تم تحديث الصلاحيات بنجاح' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map