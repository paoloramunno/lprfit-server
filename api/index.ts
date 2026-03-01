import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedExpressApp: ReturnType<typeof express> | null = null;

async function getExpressApp() {
  if (cachedExpressApp) return cachedExpressApp;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: false,
  });
  app.enableCors();
  await app.init();
  cachedExpressApp = expressApp;
  return expressApp;
}

export default async function handler(req: any, res: any) {
  const app = await getExpressApp();
  return app(req, res);
}
