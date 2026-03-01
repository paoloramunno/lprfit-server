"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
let cachedExpressApp = null;
async function getExpressApp() {
    if (cachedExpressApp)
        return cachedExpressApp;
    const { NestFactory } = await import('@nestjs/core');
    const { ExpressAdapter } = await import('@nestjs/platform-express');
    const { AppModule } = await import('../src/app.module');
    const expressApp = (0, express_1.default)();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
        logger: false,
    });
    app.enableCors();
    await app.init();
    cachedExpressApp = expressApp;
    return expressApp;
}
async function handler(req, res) {
    try {
        const app = await getExpressApp();
        return app(req, res);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'unknown serverless error';
        const stack = error instanceof Error ? error.stack : undefined;
        console.error('Vercel API bootstrap error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'api_bootstrap_failed',
            message,
            stack,
        }));
    }
}
//# sourceMappingURL=index.js.map