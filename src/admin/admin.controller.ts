import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

type RequestUser = {
  user: {
    sub: string;
  };
};

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/today')
  getToday() {
    return this.adminService.getTodayDashboard();
  }

  @Get('users')
  getUsers(@Query('q') q?: string) {
    return this.adminService.searchUsers(q);
  }

  @Get('boutique/slots')
  getBoutiqueSlots(@Query('date') date: string) {
    return this.adminService.getBoutiqueSlotsWithBookings(date);
  }

  @Get('boutique/bookings')
  getUserBoutiqueBookings(@Query('userId') userId: string) {
    return this.adminService.getUserBoutiqueBookings(userId);
  }

  @Post('boutique/bookings')
  createBoutiqueBooking(@Body() body: { userId: string; timeSlotId: string }) {
    return this.adminService.createBookingForUser(body.userId, body.timeSlotId);
  }

  @Get('calendar')
  getCalendarDay(@Query('date') date: string) {
    return this.adminService.getCalendarDay(date);
  }

  @Post('calendar/events')
  createCalendarEvent(@Req() req: RequestUser, @Body() body: { timeSlotId: string; text: string }) {
    return this.adminService.createCalendarEvent({
      adminId: req.user.sub,
      timeSlotId: body.timeSlotId,
      text: body.text,
    });
  }

  @Patch('calendar/bookings/:id/move')
  moveBooking(@Param('id') id: string, @Body() body: { targetTimeSlotId: string }) {
    return this.adminService.moveBooking(id, body.targetTimeSlotId);
  }

  @Delete('calendar/bookings/:id')
  cancelBooking(@Param('id') id: string) {
    return this.adminService.cancelBooking(id);
  }

  @Post('calendar/trial-booking')
  createTrialBooking(@Body() body: { timeSlotId: string; firstName: string; lastName: string }) {
    return this.adminService.createTrialBooking(body);
  }

  @Get('checks/pending')
  getPendingChecks() {
    return this.adminService.getPendingChecks();
  }

  @Get('checks/processed')
  getProcessedChecks() {
    return this.adminService.getProcessedChecks();
  }

  @Post('checks/:id/process')
  markCheckAsProcessed(@Req() req: RequestUser, @Param('id') id: string) {
    return this.adminService.markCheckAsProcessed(id, req.user.sub);
  }
}
