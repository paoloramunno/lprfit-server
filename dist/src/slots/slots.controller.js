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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotsController = void 0;
const common_1 = require("@nestjs/common");
const slots_service_1 = require("./slots.service");
let SlotsController = class SlotsController {
    slotsService;
    constructor(slotsService) {
        this.slotsService = slotsService;
    }
    async getSlots(date, type) {
        let parsedType;
        if (type) {
            if (type !== 'BOUTIQUE_FITNESS' && type !== 'COACHING_ONLINE') {
                throw new common_1.BadRequestException('type must be BOUTIQUE_FITNESS or COACHING_ONLINE');
            }
            parsedType = type;
        }
        const slots = await this.slotsService.list(date, parsedType);
        return slots.map((slot) => ({
            id: slot.id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.capacity,
            bookedCount: slot.bookedCount,
            available: slot.capacity - slot.bookedCount,
            sessionType: slot.sessionType.code,
            sessionTypeName: slot.sessionType.name,
        }));
    }
};
exports.SlotsController = SlotsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SlotsController.prototype, "getSlots", null);
exports.SlotsController = SlotsController = __decorate([
    (0, common_1.Controller)('slots'),
    __metadata("design:paramtypes", [slots_service_1.SlotsService])
], SlotsController);
//# sourceMappingURL=slots.controller.js.map