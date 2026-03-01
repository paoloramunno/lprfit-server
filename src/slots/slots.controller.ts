import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SessionTypeCode } from '@prisma/client';
import { SlotsService } from './slots.service';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  async getSlots(
    @Query('date') date: string,
    @Query('type') type?: string,
  ) {
    let parsedType: SessionTypeCode | undefined;
    if (type) {
      if (type !== 'BOUTIQUE_FITNESS' && type !== 'COACHING_ONLINE') {
        throw new BadRequestException(
          'type must be BOUTIQUE_FITNESS or COACHING_ONLINE',
        );
      }
      parsedType = type as SessionTypeCode;
    }

    const slots = await this.slotsService.list(date, parsedType);

    return slots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      available: slot.capacity - slot.bookedCount,
      sessionType: slot.sessionType.code,
      sessionTypeName: slot.sessionType.name,
    }));
  }
}
