import { SessionTypeCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class SlotsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(date: string, type?: SessionTypeCode): Promise<({
        sessionType: {
            id: number;
            name: string;
            code: import("@prisma/client").$Enums.SessionTypeCode;
            description: string | null;
        };
    } & {
        id: string;
        sessionTypeId: number;
        date: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        bookedCount: number;
    })[]>;
}
