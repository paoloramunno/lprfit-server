import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { BookingsService } from './bookings.service';

type Role = 'ADMIN' | 'USER';

type RequestUser = {
  user: {
    sub: string;
    role: Role;
  };
};

@UseGuards(AuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Req() req: RequestUser, @Body() body: { timeSlotId: string }) {
    return this.bookingsService.create(req.user.sub, body.timeSlotId);
  }

  @Delete(':id')
  cancel(@Req() req: RequestUser, @Param('id') id: string) {
    return this.bookingsService.cancel(req.user.sub, req.user.role, id);
  }
}
