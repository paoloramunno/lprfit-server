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

  private combineDateAndTime(dateValue: Date, timeValue: Date) {
    return new Date(
      Date.UTC(
        dateValue.getUTCFullYear(),
        dateValue.getUTCMonth(),
        dateValue.getUTCDate(),
        timeValue.getUTCHours(),
        timeValue.getUTCMinutes(),
        timeValue.getUTCSeconds(),
      ),
    );
  }

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

  async getCalendarDay(date: string) {
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
        calendarEvents: {
          include: {
            createdBy: {
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

    return {
      date: parsed,
      slots: slots.map((slot) => ({
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        available: slot.capacity - slot.bookedCount,
        bookings: slot.bookings.map((b) => ({
          bookingId: b.id,
          userId: b.userId,
          fullName: b.user.fullName,
          email: b.user.email,
        })),
        events: slot.calendarEvents.map((e) => ({
          id: e.id,
          text: e.text,
          createdAt: e.createdAt,
          createdBy: e.createdBy,
        })),
      })),
    };
  }

  async createCalendarEvent(input: { adminId: string; timeSlotId: string; text: string }) {
    const text = input.text?.trim();
    if (!input.timeSlotId || !text) {
      throw new BadRequestException('timeSlotId and text are required');
    }

    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: input.timeSlotId },
      include: { sessionType: true },
    });
    if (!slot) {
      throw new NotFoundException('time slot not found');
    }
    if (slot.sessionType.code !== 'BOUTIQUE_FITNESS') {
      throw new BadRequestException('calendar events are available only for boutique fitness');
    }

    return this.prisma.calendarEvent.create({
      data: {
        timeSlotId: input.timeSlotId,
        text,
        createdById: input.adminId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async moveBooking(bookingId: string, targetTimeSlotId: string) {
    if (!bookingId || !targetTimeSlotId) {
      throw new BadRequestException('bookingId and targetTimeSlotId are required');
    }

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { timeSlot: { include: { sessionType: true } } },
      });
      if (!booking) {
        throw new NotFoundException('booking not found');
      }
      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestException('only confirmed bookings can be moved');
      }

      const targetSlot = await tx.timeSlot.findUnique({
        where: { id: targetTimeSlotId },
        include: { sessionType: true },
      });
      if (!targetSlot) {
        throw new NotFoundException('target time slot not found');
      }
      if (targetSlot.sessionType.code !== 'BOUTIQUE_FITNESS') {
        throw new BadRequestException('target slot must be boutique fitness');
      }
      if (targetSlot.bookedCount >= targetSlot.capacity) {
        throw new ConflictException('target slot is full');
      }

      if (booking.timeSlotId === targetTimeSlotId) {
        return booking;
      }

      const duplicate = await tx.booking.findUnique({
        where: {
          userId_timeSlotId: {
            userId: booking.userId,
            timeSlotId: targetTimeSlotId,
          },
        },
      });
      if (duplicate && duplicate.id !== booking.id && duplicate.status === BookingStatus.CONFIRMED) {
        throw new ConflictException('user already booked in target slot');
      }

      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { bookedCount: { decrement: 1 } },
      });

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { timeSlotId: targetTimeSlotId, status: BookingStatus.CONFIRMED },
      });

      await tx.timeSlot.update({
        where: { id: targetTimeSlotId },
        data: { bookedCount: { increment: 1 } },
      });

      return updated;
    });
  }

  async cancelBooking(bookingId: string) {
    if (!bookingId) {
      throw new BadRequestException('bookingId is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        throw new NotFoundException('booking not found');
      }
      if (booking.status === BookingStatus.CANCELLED) {
        return booking;
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { bookedCount: { decrement: 1 } },
      });

      return updated;
    });
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

  async getUserBoutiqueBookings(userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        timeSlot: {
          sessionType: {
            code: 'BOUTIQUE_FITNESS',
          },
        },
      },
      include: {
        timeSlot: {
          include: {
            sessionType: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const now = new Date();
    const active: Array<{
      bookingId: string;
      slotId: string;
      status: BookingStatus;
      date: Date;
      startTime: Date;
      endTime: Date;
      sessionType: string;
      sessionTypeName: string;
    }> = [];
    const past: Array<{
      bookingId: string;
      slotId: string;
      status: BookingStatus;
      date: Date;
      startTime: Date;
      endTime: Date;
      sessionType: string;
      sessionTypeName: string;
    }> = [];

    for (const booking of bookings) {
      const slotEnd = this.combineDateAndTime(booking.timeSlot.date, booking.timeSlot.endTime);
      const row = {
        bookingId: booking.id,
        slotId: booking.timeSlotId,
        status: booking.status,
        date: booking.timeSlot.date,
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.timeSlot.sessionType.code,
        sessionTypeName: booking.timeSlot.sessionType.name,
      };

      if (booking.status === BookingStatus.CONFIRMED && slotEnd >= now) {
        active.push(row);
      } else {
        past.push(row);
      }
    }

    const sortByDateTimeAsc = (
      a: { date: Date; startTime: Date },
      b: { date: Date; startTime: Date },
    ) => {
      const aDt = this.combineDateAndTime(a.date, a.startTime).getTime();
      const bDt = this.combineDateAndTime(b.date, b.startTime).getTime();
      return aDt - bDt;
    };

    active.sort(sortByDateTimeAsc);
    past.sort((a, b) => sortByDateTimeAsc(b, a));

    return { active, past };
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
