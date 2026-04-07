import { FirebaseService } from '../firebase/firebase.service';
export declare class UsersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getUserById(uid: string): Promise<{
        id: string;
    }>;
    createUserProfile(uid: string, data: any): Promise<{
        fullName: any;
        email: any;
        phone: any;
        role: any;
        stationScopes: any;
        createdAt: string;
        id: string;
    }>;
    getAllUsers(): Promise<{
        id: string;
    }[]>;
    updateUserRole(uid: string, role: string, stationScopes?: string[]): Promise<{
        message: string;
    }>;
}
