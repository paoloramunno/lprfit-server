import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

let cachedExpressApp: ReturnType<typeof express> | null = null;

async function getExpressApp() {
  if (cachedExpressApp) return cachedExpressApp;

  // Lazy-load AppModule so startup errors are caught and returned as JSON
  // instead of crashing the whole serverless function before handler runs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AppModule } = require('../src/app.module');

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
  if (req?.url?.startsWith('/__diag')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        ok: true,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
      }),
    );
    return;
  }

  try {
    const app = await getExpressApp();
    return app(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown serverless error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('Vercel API bootstrap error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'api_bootstrap_failed',
        message,
        stack,
      }),
    );
  }
}
