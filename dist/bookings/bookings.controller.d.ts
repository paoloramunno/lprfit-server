import { Role } from '@prisma/client';
import { BookingsService } from './bookings.service';
type RequestUser = {
    user: {
        sub: string;
        role: Role;
    };
};
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: RequestUser, body: {
        timeSlotId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: string;
        timeSlotId: string;
    }>;
    cancel(req: RequestUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: string;
        timeSlotId: string;
    }>;
}
export {};
