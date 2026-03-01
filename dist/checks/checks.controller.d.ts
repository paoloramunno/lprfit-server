import { Role } from '@prisma/client';
import { ChecksService } from './checks.service';
type RequestUser = {
    user: {
        sub: string;
        role: Role;
    };
};
type UploadedFields = {
    frontPhoto?: Array<{
        filename: string;
    }>;
    backPhoto?: Array<{
        filename: string;
    }>;
    profileOnePhoto?: Array<{
        filename: string;
    }>;
    profileTwoPhoto?: Array<{
        filename: string;
    }>;
};
export declare class ChecksController {
    private readonly checksService;
    constructor(checksService: ChecksService);
    list(req: RequestUser, userId?: string): Promise<({
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
    })[]>;
    create(req: RequestUser, files: UploadedFields, body: {
        userId?: string;
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
        sleepCompared: string;
        stressHigherThanUsual: string;
        weight: string;
        gluteCircumference: string;
        waistCircumference: string;
        thighCircumference: string;
        muscleMass: string;
        fatMass: string;
        bodyWater: string;
    }): Promise<{
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
    }>;
}
export {};
