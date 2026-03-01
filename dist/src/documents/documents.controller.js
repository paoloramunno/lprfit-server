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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const auth_guard_1 = require("../auth/auth.guard");
const documents_service_1 = require("./documents.service");
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.heic', '.webp'];
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    list(req, userId) {
        return this.documentsService.listForRequester(req.user.sub, req.user.role, userId);
    }
    upload(req, file, body) {
        if (!file) {
            throw new common_1.BadRequestException('file is required');
        }
        const docType = this.documentsService.validateDocType(body.docType);
        return this.documentsService.upload({
            requesterId: req.user.sub,
            requesterRole: req.user.role,
            docType,
            fileUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            targetUserId: body.userId,
        });
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (_, file, cb) => {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            const isPdf = file.mimetype === 'application/pdf' ||
                ext === '.pdf';
            const isImage = file.mimetype.startsWith('image/') && ALLOWED_EXT.includes(ext);
            if (!isPdf && !isImage) {
                cb(new common_1.BadRequestException('allowed files: PDF, JPG, JPEG, PNG, HEIC, WEBP'), false);
                return;
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map