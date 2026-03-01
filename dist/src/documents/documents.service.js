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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForRequester(requesterId, requesterRole, userId) {
        if (requesterRole === Role.ADMIN) {
            const where = userId ? { userId } : undefined;
            return this.prisma.document.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                    uploader: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return this.prisma.document.findMany({
            where: { userId: requesterId },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                uploader: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async upload(input) {
        const ownerUserId = input.requesterRole === Role.ADMIN && input.targetUserId
            ? input.targetUserId
            : input.requesterId;
        if (input.requesterRole !== Role.ADMIN && input.targetUserId && input.targetUserId !== input.requesterId) {
            throw new common_1.UnauthorizedException('user can upload documents only for self');
        }
        const owner = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
        if (!owner) {
            throw new common_1.NotFoundException('target user not found');
        }
        return this.prisma.document.create({
            data: {
                userId: ownerUserId,
                docType: input.docType,
                fileUrl: input.fileUrl,
                uploadedBy: input.requesterId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                uploader: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    validateDocType(value) {
        if (value !== 'WORKOUT_PDF' &&
            value !== 'DIET_PDF' &&
            value !== 'MEDICAL_CERT_PDF' &&
            value !== 'BODY_CHECK_PDF') {
            throw new common_1.BadRequestException('invalid docType');
        }
        return value;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map