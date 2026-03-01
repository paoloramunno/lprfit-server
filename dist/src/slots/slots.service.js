"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SlotsService = class SlotsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(date, type) {
        if (!date) {
            throw new common_1.BadRequestException('date is required (YYYY-MM-DD)');
        }
        const parsed = new Date(`${date}T00:00:00.000Z`);
        if (Number.isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException('invalid date format, expected YYYY-MM-DD');
        }
        return this.prisma.timeSlot.findMany({
            where: {
                date: parsed,
                sessionType: type ? { code: type } : undefined,
            },
            include: {
                sessionType: true,
            },
            orderBy: [{ startTime: 'asc' }],
        });
    }
};
exports.SlotsService = SlotsService;
exports.SlotsService = SlotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SlotsService);
//# sourceMappingURL=slots.service.js.map