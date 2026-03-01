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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const auth_guard_1 = require("./auth.guard");
let AdminGuard = class AdminGuard {
    authGuard;
    constructor(authGuard) {
        this.authGuard = authGuard;
    }
    canActivate(context) {
        const isAuthenticated = this.authGuard.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        if (request.user?.role !== client_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('admin access required');
        }
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_guard_1.AuthGuard])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map