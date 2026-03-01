import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, SleepComparison } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
