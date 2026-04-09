import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class StationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createStation(stationData: any) {
    const db = this.firebaseService.getFirestore();
    const stationsCollection = db.collection('stations');
    
    // Check if stationNumber already exists since it should be Unique
    if (stationData.stationNumber) {
      const existing = await stationsCollection.where('stationNumber', '==', stationData.stationNumber).get();
      if (!existing.empty) {
        throw new BadRequestException('Station number already exists (must be unique)');
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

  async updateStation(id: string, stationData: any) {
    const db = this.firebaseService.getFirestore();
    const stationRef = db.collection('stations').doc(id);

    const doc = await stationRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Station not found');
    }

    await stationRef.update({
      ...stationData,
      updatedAt: new Date().toISOString()
    });

    return { message: 'Station updated successfully' };
  }

  async deleteStation(id: string) {
    const db = this.firebaseService.getFirestore();
    const stationRef = db.collection('stations').doc(id);

    const doc = await stationRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Station not found');
    }

    await stationRef.delete();
    return { message: 'Station deleted successfully' };
  }
}
