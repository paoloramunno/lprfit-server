import { PrismaService } from '../prisma/prisma.service';
type Role = 'ADMIN' | 'USER';
declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
};
export type CreateCheckInput = {
    requesterId: string;
    requesterRole: Role;
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
    frontPhotoUrl: string;
    backPhotoUrl: string;
    profileOnePhotoUrl: string;
    profileTwoPhotoUrl: string;
};
type CheckPhotoType = 'front' | 'back' | 'profile1' | 'profile2';
export declare class ChecksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForRequester(requesterId: string, requesterRole: Role, userId?: string): Promise<{
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
    create(input: CreateCheckInput): Promise<{
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
    getPhotoForRequester(requesterId: string, requesterRole: Role, checkId: string, photoType: CheckPhotoType): Promise<{
        mimeType: string;
        buffer: Buffer<ArrayBuffer>;
    }>;
    private required;
    private parseSleepCompared;
}
export {};
