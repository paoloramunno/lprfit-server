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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(input) {
        const email = input.email?.trim().toLowerCase();
        const password = input.password?.trim();
        const firstName = input.firstName?.trim();
        const lastName = input.lastName?.trim();
        const phone = input.phone?.trim();
        const birthDateRaw = input.birthDate?.trim();
        if (!email || !password || !firstName || !lastName || !phone || !birthDateRaw) {
            throw new common_1.BadRequestException('email, password, firstName, lastName, phone and birthDate are required');
        }
        if (password.length < 6) {
            throw new common_1.BadRequestException('password must be at least 6 characters');
        }
        const birthDate = new Date(`${birthDateRaw}T00:00:00.000Z`);
        if (Number.isNaN(birthDate.getTime())) {
            throw new common_1.BadRequestException('invalid birthDate format, expected YYYY-MM-DD');
        }
        const exists = await this.prisma.user.findUnique({ where: { email } });
        if (exists) {
            throw new common_1.BadRequestException('email already registered');
        }
        const user = await this.prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                phone,
                birthDate,
                role: Role.USER,
                passwordHash: this.hashPassword(password),
            },
        });
        const safeUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            birthDate: user.birthDate,
            role: user.role,
        };
        return {
            user: safeUser,
            accessToken: this.signToken(safeUser),
        };
    }
    async login(input) {
        const email = input.email?.trim().toLowerCase();
        const password = input.password?.trim();
        if (!email || !password) {
            throw new common_1.BadRequestException('email and password are required');
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !this.verifyPassword(password, user.passwordHash)) {
            throw new common_1.UnauthorizedException('invalid credentials');
        }
        const safeUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            birthDate: user.birthDate,
            role: user.role,
        };
        return {
            user: safeUser,
            accessToken: this.signToken(safeUser),
        };
    }
    async loginAdmin(input) {
        const result = await this.login(input);
        if (result.user.role !== Role.ADMIN) {
            throw new common_1.UnauthorizedException('admin access required');
        }
        return result;
    }
    verifyAccessToken(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new common_1.UnauthorizedException('invalid token format');
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const unsignedToken = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = (0, crypto_1.createHmac)('sha256', this.getSecret())
            .update(unsignedToken)
            .digest('base64url');
        if (expectedSignature !== signature) {
            throw new common_1.UnauthorizedException('invalid token signature');
        }
        let payload;
        try {
            payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        }
        catch {
            throw new common_1.UnauthorizedException('invalid token payload');
        }
        if (!payload.sub || !payload.email || !payload.role || !payload.exp) {
            throw new common_1.UnauthorizedException('invalid token claims');
        }
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            throw new common_1.UnauthorizedException('token expired');
        }
        return payload;
    }
    hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }
    verifyPassword(password, stored) {
        const [salt, key] = stored.split(':');
        if (!salt || !key)
            return false;
        const hashBuffer = Buffer.from(key, 'hex');
        const compareBuffer = (0, crypto_1.scryptSync)(password, salt, 64);
        if (hashBuffer.length !== compareBuffer.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(hashBuffer, compareBuffer);
    }
    signToken(user) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.fullName,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        };
        const encodedHeader = this.base64url(JSON.stringify(header));
        const encodedPayload = this.base64url(JSON.stringify(payload));
        const unsignedToken = `${encodedHeader}.${encodedPayload}`;
        const signature = (0, crypto_1.createHmac)('sha256', this.getSecret())
            .update(unsignedToken)
            .digest('base64url');
        return `${unsignedToken}.${signature}`;
    }
    getSecret() {
        return process.env.JWT_SECRET || 'lprfit-dev-secret-change-me';
    }
    base64url(value) {
        return Buffer.from(value, 'utf8').toString('base64url');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map