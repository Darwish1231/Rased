import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(req: any): Promise<{
        id: string;
    }>;
    createProfile(body: any, req: any): Promise<{
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
    updateUserRole(id: string, role: string, stationScopes: string[]): Promise<{
        message: string;
    }>;
}
