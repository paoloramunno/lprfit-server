"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsPath)) {
        (0, fs_1.mkdirSync)(uploadsPath, { recursive: true });
    }
    app.use('/uploads', express_1.default.static(uploadsPath));
    await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map