import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { DocumentsModule } from './documents/documents.module';
import { ChecksModule } from './checks/checks.module';
import { PrismaModule } from './prisma/prisma.module';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SlotsModule,
    BookingsModule,
    AdminModule,
    DocumentsModule,
    ChecksModule,
  ],
})
export class AppModule {}
