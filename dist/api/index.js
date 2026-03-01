"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("../src/app.module");
let cachedExpressApp = null;
async function getExpressApp() {
    if (cachedExpressApp)
        return cachedExpressApp;
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
        logger: false,
    });
    app.enableCors();
    await app.init();
    cachedExpressApp = expressApp;
    return expressApp;
}
async function handler(req, res) {
    if (req?.url?.startsWith('/__diag')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            ok: true,
            hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
            hasDirectUrl: Boolean(process.env.DIRECT_URL),
            hasJwtSecret: Boolean(process.env.JWT_SECRET),
        }));
        return;
    }
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