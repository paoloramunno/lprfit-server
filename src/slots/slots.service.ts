import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SessionTypeCode = 'BOUTIQUE_FITNESS' | 'COACHING_ONLINE';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(date: string, type?: SessionTypeCode) {
    if (!date) {
      throw new BadRequestException('date is required (YYYY-MM-DD)');
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('invalid date format, expected YYYY-MM-DD');
    }

    return this.prisma.timeSlot.findMany({
      where: {
        date: parsed,
        sessionType: type ? { code: type } : undefined,
      },
      include: {
        sessionType: true,
      },
      orderBy: [{ startTime: 'asc' }],
    });
  }
}
