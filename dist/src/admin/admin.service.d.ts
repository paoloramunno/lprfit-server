import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTodayDashboard(): Promise<{
        date: Date;
        metrics: {
            confirmedBookings: number;
            activeUsers: number;
            totalCapacity: number;
            totalBooked: number;
        };
        slots: {
            id: string;
            type: import("@prisma/client").$Enums.SessionTypeCode;
            typeName: string;
            startTime: Date;
            endTime: Date;
            capacity: number;
            bookedCount: number;
            available: number;
        }[];
    }>;
    searchUsers(query?: string): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        firstName: string | null;
        lastName: string | null;
        fullName: string;
        phone: string | null;
        birthDate: Date | null;
    }[]>;
    getBoutiqueSlotsWithBookings(date: string): Promise<{
        id: string;
        date: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        bookedCount: number;
        available: number;
        bookedUsers: {
            bookingId: string;
            userId: string;
            fullName: string;
            email: string;
        }[];
    }[]>;
    createBookingForUser(userId: string, timeSlotId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: string;
        timeSlotId: string;
    }>;
    getPendingChecks(): Promise<{
        id: string;
        createdAt: Date;
        workoutsPerWeek: string;
        workoutIssues: string;
        workoutChanges: string;
        stepsOnTarget: string;
        workoutScore: string;
        freeMeals: string;
        nutritionIssues: string;
        nutritionScore: string;
        sleepRegular: string;
        sleepHours: string;
        sleepCompared: import("@prisma/client").$Enums.SleepComparison;
        stressHigherThanUsual: string;
        weight: string;
        gluteCircumference: string;
        waistCircumference: string;
        thighCircumference: string;
        muscleMass: string;
        fatMass: string;
        bodyWater: string;
        isProcessed: boolean;
        processedAt: Date | null;
        owner: {
            id: string;
            email: string;
            fullName: string;
        };
        creator: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            fullName: string;
        };
    }[]>;
    getProcessedChecks(): Promise<{
        id: string;
        createdAt: Date;
        workoutsPerWeek: string;
        workoutIssues: string;
        workoutChanges: string;
        stepsOnTarget: string;
        workoutScore: string;
        freeMeals: string;
        nutritionIssues: string;
        nutritionScore: string;
        sleepRegular: string;
        sleepHours: string;
        sleepCompared: import("@prisma/client").$Enums.SleepComparison;
        stressHigherThanUsual: string;
        weight: string;
        gluteCircumference: string;
        waistCircumference: string;
        thighCircumference: string;
        muscleMass: string;
        fatMass: string;
        bodyWater: string;
        isProcessed: boolean;
        processedAt: Date | null;
        owner: {
            id: string;
            email: string;
            fullName: string;
        };
        creator: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            fullName: string;
        };
        processor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    }[]>;
    markCheckAsProcessed(checkId: string, adminId: string): Promise<({
        owner: {
            id: string;
            email: string;
            fullName: string;
        };
        creator: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            fullName: string;
        };
        processor: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        createdById: string;
        workoutsPerWeek: string;
        workoutIssues: string;
        workoutChanges: string;
        stepsOnTarget: string;
        workoutScore: string;
        freeMeals: string;
        nutritionIssues: string;
        nutritionScore: string;
        sleepRegular: string;
        sleepHours: string;
        sleepCompared: import("@prisma/client").$Enums.SleepComparison;
        stressHigherThanUsual: string;
        weight: string;
        gluteCircumference: string;
        waistCircumference: string;
        thighCircumference: string;
        muscleMass: string;
        fatMass: string;
        bodyWater: string;
        frontPhotoUrl: string;
        backPhotoUrl: string;
        profileOnePhotoUrl: string;
        profileTwoPhotoUrl: string;
        isProcessed: boolean;
        processedAt: Date | null;
        processedById: string | null;
    }) | null>;
}
