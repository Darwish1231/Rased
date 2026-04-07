import { FirebaseService } from '../firebase/firebase.service';
export declare class StationsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    createStation(stationData: any): Promise<{
        stationNumber: any;
        name: any;
        region: any;
        location: any;
        address: any;
        createdAt: string;
        id: string;
    }>;
    getAllStations(): Promise<{
        id: string;
    }[]>;
    updateStation(id: string, stationData: any): Promise<{
        message: string;
    }>;
    deleteStation(id: string): Promise<{
        message: string;
    }>;
}
