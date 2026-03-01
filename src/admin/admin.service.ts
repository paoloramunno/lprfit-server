import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type BookingStatus = 'CONFIRMED' | 'CANCELLED';
const BookingStatus = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayDashboard() {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const slots = await this.prisma.timeSlot.findMany({
      where: { date: start },
      include: { sessionType: true },
      orderBy: [{ sessionTypeId: 'asc' }, { startTime: 'asc' }],
    });

    const confirmedToday = await this.prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        timeSlot: { date: start },
      },
    });

    const activeUsers = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        timeSlot: { date: start },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    return {
      date: start,
      metrics: {
        confirmedBookings: confirmedToday,
        activeUsers: activeUsers.length,
        totalCapacity: slots.reduce((acc, s) => acc + s.capacity, 0),
        totalBooked: slots.reduce((acc, s) => acc + s.bookedCount, 0),
      },
      slots: slots.map((slot) => ({
        id: slot.id,
        type: slot.sessionType.code,
        typeName: slot.sessionType.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        available: slot.capacity - slot.bookedCount,
      })),
    };
  }

  async searchUsers(query?: string) {
    const q = query?.trim();

    return this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        email: true,
        phone: true,
        birthDate: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async getBoutiqueSlotsWithBookings(date: string) {
    if (!date) {
      throw new BadRequestException('date is required (YYYY-MM-DD)');
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('invalid date format, expected YYYY-MM-DD');
    }

    const slots = await this.prisma.timeSlot.findMany({
      where: {
        date: parsed,
        sessionType: { code: 'BOUTIQUE_FITNESS' },
      },
      include: {
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      available: slot.capacity - slot.bookedCount,
      bookedUsers: slot.bookings.map((b) => ({
        bookingId: b.id,
        userId: b.userId,
        fullName: b.user.fullName,
        email: b.user.email,
      })),
    }));
  }

  async createBookingForUser(userId: string, timeSlotId: string) {
    if (!userId || !timeSlotId) {
      throw new BadRequestException('userId and timeSlotId are required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
        include: { sessionType: true },
      });
      if (!slot) {
        throw new NotFoundException('time slot not found');
      }

      if (slot.sessionType.code !== 'BOUTIQUE_FITNESS') {
        throw new BadRequestException(
          'admin direct booking is allowed only for BOUTIQUE_FITNESS slots',
        );
      }

      if (slot.bookedCount >= slot.capacity) {
        throw new ConflictException('slot is full');
      }

      const existing = await tx.booking.findUnique({
        where: {
          userId_timeSlotId: {
            userId,
            timeSlotId,
          },
        },
      });

      if (existing && existing.status === BookingStatus.CONFIRMED) {
        throw new ConflictException('booking already exists');
      }

      if (existing && existing.status === BookingStatus.CANCELLED) {
        const updated = await tx.booking.update({
          where: { id: existing.id },
          data: { status: BookingStatus.CONFIRMED },
        });

        await tx.timeSlot.update({
          where: { id: timeSlotId },
          data: { bookedCount: { increment: 1 } },
        });

        return updated;
      }

      const booking = await tx.booking.create({
        data: {
          userId,
          timeSlotId,
          status: BookingStatus.CONFIRMED,
        },
      });

      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { bookedCount: { increment: 1 } },
      });

      return booking;
    });
  }

  async getPendingChecks() {
    return this.prisma.coachingCheck.findMany({
      where: { isProcessed: false },
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

  async getProcessedChecks() {
    return this.prisma.coachingCheck.findMany({
      where: { isProcessed: true },
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
        processor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { processedAt: 'desc' },
    });
  }

  async markCheckAsProcessed(checkId: string, adminId: string) {
    if (!checkId) {
      throw new BadRequestException('checkId is required');
    }

    const existing = await this.prisma.coachingCheck.findUnique({ where: { id: checkId } });
    if (!existing) {
      throw new NotFoundException('check not found');
    }

    if (existing.isProcessed) {
      return this.prisma.coachingCheck.findUnique({
        where: { id: checkId },
        include: {
          owner: { select: { id: true, fullName: true, email: true } },
          creator: { select: { id: true, fullName: true, email: true, role: true } },
          processor: { select: { id: true, fullName: true, email: true } },
        },
      });
    }

    return this.prisma.coachingCheck.update({
      where: { id: checkId },
      data: {
        isProcessed: true,
        processedAt: new Date(),
        processedById: adminId,
      },
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true, role: true } },
        processor: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}
