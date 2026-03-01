"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};
const SleepComparison = {
    BETTER: 'BETTER',
    WORSE: 'WORSE',
    SAME: 'SAME',
};
let ChecksService = class ChecksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForRequester(requesterId, requesterRole, userId) {
        let ownerUserId = requesterId;
        if (requesterRole === Role.ADMIN) {
            if (!userId) {
                throw new common_1.BadRequestException('userId is required for trainer view');
            }
            ownerUserId = userId;
        }
        return this.prisma.coachingCheck.findMany({
            where: { userId: ownerUserId },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(input) {
        const ownerUserId = input.requesterRole === Role.ADMIN && input.userId
            ? input.userId
            : input.requesterId;
        if (input.requesterRole !== Role.ADMIN && input.userId && input.userId !== input.requesterId) {
            throw new common_1.UnauthorizedException('user can create checks only for self');
        }
        const owner = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
        if (!owner) {
            throw new common_1.NotFoundException('target user not found');
        }
        const sleepCompared = this.parseSleepCompared(input.sleepCompared);
        return this.prisma.coachingCheck.create({
            data: {
                userId: ownerUserId,
                createdById: input.requesterId,
                workoutsPerWeek: this.required(input.workoutsPerWeek, 'workoutsPerWeek'),
                workoutIssues: this.required(input.workoutIssues, 'workoutIssues'),
                workoutChanges: this.required(input.workoutChanges, 'workoutChanges'),
                stepsOnTarget: this.required(input.stepsOnTarget, 'stepsOnTarget'),
                workoutScore: this.required(input.workoutScore, 'workoutScore'),
                freeMeals: this.required(input.freeMeals, 'freeMeals'),
                nutritionIssues: this.required(input.nutritionIssues, 'nutritionIssues'),
                nutritionScore: this.required(input.nutritionScore, 'nutritionScore'),
                sleepRegular: this.required(input.sleepRegular, 'sleepRegular'),
                sleepHours: this.required(input.sleepHours, 'sleepHours'),
                sleepCompared,
                stressHigherThanUsual: this.required(input.stressHigherThanUsual, 'stressHigherThanUsual'),
                weight: this.required(input.weight, 'weight'),
                gluteCircumference: this.required(input.gluteCircumference, 'gluteCircumference'),
                waistCircumference: this.required(input.waistCircumference, 'waistCircumference'),
                thighCircumference: this.required(input.thighCircumference, 'thighCircumference'),
                muscleMass: this.required(input.muscleMass, 'muscleMass'),
                fatMass: this.required(input.fatMass, 'fatMass'),
                bodyWater: this.required(input.bodyWater, 'bodyWater'),
                frontPhotoUrl: this.required(input.frontPhotoUrl, 'frontPhotoUrl'),
                backPhotoUrl: this.required(input.backPhotoUrl, 'backPhotoUrl'),
                profileOnePhotoUrl: this.required(input.profileOnePhotoUrl, 'profileOnePhotoUrl'),
                profileTwoPhotoUrl: this.required(input.profileTwoPhotoUrl, 'profileTwoPhotoUrl'),
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
    required(value, field) {
        const parsed = value?.trim();
        if (!parsed) {
            throw new common_1.BadRequestException(`${field} is required`);
        }
        return parsed;
    }
    parseSleepCompared(value) {
        const normalized = value?.trim().toUpperCase();
        if (normalized === 'BETTER')
            return SleepComparison.BETTER;
        if (normalized === 'WORSE')
            return SleepComparison.WORSE;
        if (normalized === 'SAME')
            return SleepComparison.SAME;
        throw new common_1.BadRequestException('sleepCompared must be BETTER, WORSE or SAME');
    }
};
exports.ChecksService = ChecksService;
exports.ChecksService = ChecksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChecksService);
//# sourceMappingURL=checks.service.js.map