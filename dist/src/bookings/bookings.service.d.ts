import { PrismaService } from '../prisma/prisma.service';
type Role = 'ADMIN' | 'USER';
declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
};
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
export {};
