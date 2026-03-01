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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, timeSlotId) {
        if (!userId || !timeSlotId) {
            throw new common_1.BadRequestException('userId and timeSlotId are required');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('user not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const slot = await tx.timeSlot.findUnique({ where: { id: timeSlotId } });
            if (!slot) {
                throw new common_1.NotFoundException('time slot not found');
            }
            if (slot.bookedCount >= slot.capacity) {
                throw new common_1.ConflictException('slot is full');
            }
            const existing = await tx.booking.findUnique({
                where: {
                    userId_timeSlotId: {
                        userId,
                        timeSlotId,
                    },
                },
            });
            if (existing && existing.status === client_1.BookingStatus.CONFIRMED) {
                throw new common_1.ConflictException('booking already exists');
            }
            if (existing && existing.status === client_1.BookingStatus.CANCELLED) {
                const updated = await tx.booking.update({
                    where: { id: existing.id },
                    data: { status: client_1.BookingStatus.CONFIRMED },
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
                    status: client_1.BookingStatus.CONFIRMED,
                },
            });
            await tx.timeSlot.update({
                where: { id: timeSlotId },
                data: { bookedCount: { increment: 1 } },
            });
            return booking;
        });
    }
    async cancel(requesterId, requesterRole, bookingId) {
        if (!bookingId) {
            throw new common_1.BadRequestException('booking id is required');
        }
        return this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({ where: { id: bookingId } });
            if (!booking) {
                throw new common_1.NotFoundException('booking not found');
            }
            const isOwner = booking.userId === requesterId;
            const isAdmin = requesterRole === client_1.Role.ADMIN;
            if (!isOwner && !isAdmin) {
                throw new common_1.UnauthorizedException('not allowed to cancel this booking');
            }
            if (booking.status === client_1.BookingStatus.CANCELLED) {
                return booking;
            }
            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.CANCELLED },
            });
            await tx.timeSlot.update({
                where: { id: booking.timeSlotId },
                data: { bookedCount: { decrement: 1 } },
            });
            return updated;
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map