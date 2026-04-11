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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let StationsService = class StationsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async createStation(stationData) {
        const db = this.firebaseService.getFirestore();
        const stationsCollection = db.collection('stations');
        if (stationData.stationNumber) {
            const existing = await stationsCollection.where('stationNumber', '==', stationData.stationNumber).get();
            if (!existing.empty) {
                throw new common_1.BadRequestException('رقم المحطة مسجل مسبقاً (يجب أن يكون فريداً)');
            }
        }
        const newStation = {
            stationNumber: stationData.stationNumber || '',
            name: stationData.name || '',
            region: stationData.region || '',
            location: stationData.location || { lat: 0, lng: 0 },
            address: stationData.address || '',
            createdAt: new Date().toISOString(),
        };
        const docRef = await stationsCollection.add(newStation);
        return { id: docRef.id, ...newStation };
    }
    async getAllStations() {
        const db = this.firebaseService.getFirestore();
        const snapshot = await db.collection('stations').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async updateStation(id, stationData) {
        const db = this.firebaseService.getFirestore();
        const stationRef = db.collection('stations').doc(id);
        const doc = await stationRef.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('المحطة غير موجودة');
        }
        await stationRef.update({
            ...stationData,
            updatedAt: new Date().toISOString()
        });
        return { message: 'تم تحديث المحطة بنجاح' };
    }
    async deleteStation(id) {
        const db = this.firebaseService.getFirestore();
        const stationRef = db.collection('stations').doc(id);
        const doc = await stationRef.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('المحطة غير موجودة');
        }
        await stationRef.delete();
        return { message: 'تم حذف المحطة بنجاح' };
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], StationsService);
//# sourceMappingURL=stations.service.js.map