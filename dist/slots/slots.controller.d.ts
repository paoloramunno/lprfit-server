import { SlotsService } from './slots.service';
export declare class SlotsController {
    private readonly slotsService;
    constructor(slotsService: SlotsService);
    getSlots(date: string, type?: string): Promise<{
        id: string;
        date: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        bookedCount: number;
        available: number;
        sessionType: import("@prisma/client").$Enums.SessionTypeCode;
        sessionTypeName: string;
    }[]>;
}
