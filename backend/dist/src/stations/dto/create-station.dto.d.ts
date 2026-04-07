export declare class CreateStationDto {
    number: string;
    name: string;
    region: string;
    location: {
        lat: number;
        lng: number;
    };
    status?: string;
}
