import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
export declare class StationsController {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    createStation(createStationDto: CreateStationDto): Promise<{
        message: string;
        data: {
            stationNumber: any;
            name: any;
            region: any;
            location: any;
            address: any;
            createdAt: string;
            id: string;
        };
    }>;
    getStations(): Promise<{
        message: string;
        data: {
            id: string;
        }[];
    }>;
    updateStation(id: string, body: any): Promise<{
        message: string;
    }>;
    deleteStation(id: string): Promise<{
        message: string;
    }>;
}
