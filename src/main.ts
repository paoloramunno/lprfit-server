import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  app.use('/uploads', express.static(uploadsPath));
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
