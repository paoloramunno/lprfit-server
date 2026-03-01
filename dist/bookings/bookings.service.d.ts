import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class BookingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, timeSlotId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: string;
        timeSlotId: string;
    }>;
    cancel(requesterId: string, requesterRole: Role, bookingId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: string;
        timeSlotId: string;
    }>;
}
