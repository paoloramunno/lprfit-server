import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, timeSlotId: string) {
    if (!userId || !timeSlotId) {
      throw new BadRequestException('userId and timeSlotId are required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({ where: { id: timeSlotId } });
      if (!slot) {
        throw new NotFoundException('time slot not found');
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

  async cancel(requesterId: string, requesterRole: Role, bookingId: string) {
    if (!bookingId) {
      throw new BadRequestException('booking id is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        throw new NotFoundException('booking not found');
      }

      const isOwner = booking.userId === requesterId;
      const isAdmin = requesterRole === Role.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new UnauthorizedException('not allowed to cancel this booking');
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
}
