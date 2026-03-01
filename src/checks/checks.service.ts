import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Role = 'ADMIN' | 'USER';
const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

type SleepComparison = 'BETTER' | 'WORSE' | 'SAME';
const SleepComparison = {
  BETTER: 'BETTER',
  WORSE: 'WORSE',
  SAME: 'SAME',
} as const;

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

@Injectable()
export class ChecksService {
  constructor(private readonly prisma: PrismaService) {}

  async listForRequester(requesterId: string, requesterRole: Role, userId?: string) {
    let ownerUserId = requesterId;

    if (requesterRole === Role.ADMIN) {
      if (!userId) {
        throw new BadRequestException('userId is required for trainer view');
      }
      ownerUserId = userId;
    }

    return this.prisma.coachingCheck.findMany({
      where: { userId: ownerUserId },
      select: {
        id: true,
        workoutsPerWeek: true,
        workoutIssues: true,
        workoutChanges: true,
        stepsOnTarget: true,
        workoutScore: true,
        freeMeals: true,
        nutritionIssues: true,
        nutritionScore: true,
        sleepRegular: true,
        sleepHours: true,
        sleepCompared: true,
        stressHigherThanUsual: true,
        weight: true,
        gluteCircumference: true,
        waistCircumference: true,
        thighCircumference: true,
        muscleMass: true,
        fatMass: true,
        bodyWater: true,
        isProcessed: true,
        processedAt: true,
        createdAt: true,
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

  async create(input: CreateCheckInput) {
    const ownerUserId = input.requesterRole === Role.ADMIN && input.userId
      ? input.userId
      : input.requesterId;

    if (input.requesterRole !== Role.ADMIN && input.userId && input.userId !== input.requesterId) {
      throw new UnauthorizedException('user can create checks only for self');
    }

    const owner = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
    if (!owner) {
      throw new NotFoundException('target user not found');
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

  async getPhotoForRequester(
    requesterId: string,
    requesterRole: Role,
    checkId: string,
    photoType: CheckPhotoType,
  ) {
    const check = await this.prisma.coachingCheck.findUnique({
      where: { id: checkId },
      select: {
        userId: true,
        frontPhotoUrl: true,
        backPhotoUrl: true,
        profileOnePhotoUrl: true,
        profileTwoPhotoUrl: true,
      },
    });

    if (!check) {
      throw new NotFoundException('check not found');
    }

    if (requesterRole !== Role.ADMIN && check.userId !== requesterId) {
      throw new UnauthorizedException('not allowed to access this photo');
    }

    const raw =
      photoType === 'front'
        ? check.frontPhotoUrl
        : photoType === 'back'
          ? check.backPhotoUrl
          : photoType === 'profile1'
            ? check.profileOnePhotoUrl
            : check.profileTwoPhotoUrl;

    const match = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new BadRequestException('invalid stored photo format');
    }

    const mimeType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    return { mimeType, buffer };
  }

  private required(value: string | undefined, field: string) {
    const parsed = value?.trim();
    if (!parsed) {
      throw new BadRequestException(`${field} is required`);
    }
    return parsed;
  }

  private parseSleepCompared(value: string): SleepComparison {
    const normalized = value?.trim().toUpperCase();
    if (normalized === 'BETTER') return SleepComparison.BETTER;
    if (normalized === 'WORSE') return SleepComparison.WORSE;
    if (normalized === 'SAME') return SleepComparison.SAME;
    throw new BadRequestException('sleepCompared must be BETTER, WORSE or SAME');
  }
}
