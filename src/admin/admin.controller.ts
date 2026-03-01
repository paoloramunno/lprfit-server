import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
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

  @Post('boutique/bookings')
  createBoutiqueBooking(@Body() body: { userId: string; timeSlotId: string }) {
    return this.adminService.createBookingForUser(body.userId, body.timeSlotId);
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
