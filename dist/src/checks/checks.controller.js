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
exports.ChecksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const auth_guard_1 = require("../auth/auth.guard");
const checks_service_1 = require("./checks.service");
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'];
let ChecksController = class ChecksController {
    checksService;
    constructor(checksService) {
        this.checksService = checksService;
    }
    list(req, userId) {
        return this.checksService.listForRequester(req.user.sub, req.user.role, userId);
    }
    async getPhoto(req, id, type, res) {
        const normalized = type.toLowerCase();
        if (normalized !== 'front' &&
            normalized !== 'back' &&
            normalized !== 'profile1' &&
            normalized !== 'profile2') {
            throw new common_1.BadRequestException('photo type must be front, back, profile1 or profile2');
        }
        const photo = await this.checksService.getPhotoForRequester(req.user.sub, req.user.role, id, normalized);
        res.setHeader('Content-Type', photo.mimeType);
        res.setHeader('Cache-Control', 'private, max-age=60');
        res.send(photo.buffer);
    }
    create(req, files, body) {
        const frontPhoto = files?.frontPhoto?.[0];
        const backPhoto = files?.backPhoto?.[0];
        const profileOnePhoto = files?.profileOnePhoto?.[0];
        const profileTwoPhoto = files?.profileTwoPhoto?.[0];
        if (!frontPhoto || !backPhoto || !profileOnePhoto || !profileTwoPhoto) {
            throw new common_1.BadRequestException('all 4 photos are required');
        }
        return this.checksService.create({
            requesterId: req.user.sub,
            requesterRole: req.user.role,
            userId: body.userId,
            workoutsPerWeek: body.workoutsPerWeek,
            workoutIssues: body.workoutIssues,
            workoutChanges: body.workoutChanges,
            stepsOnTarget: body.stepsOnTarget,
            workoutScore: body.workoutScore,
            freeMeals: body.freeMeals,
            nutritionIssues: body.nutritionIssues,
            nutritionScore: body.nutritionScore,
            sleepRegular: body.sleepRegular,
            sleepHours: body.sleepHours,
            sleepCompared: body.sleepCompared,
            stressHigherThanUsual: body.stressHigherThanUsual,
            weight: body.weight,
            gluteCircumference: body.gluteCircumference,
            waistCircumference: body.waistCircumference,
            thighCircumference: body.thighCircumference,
            muscleMass: body.muscleMass,
            fatMass: body.fatMass,
            bodyWater: body.bodyWater,
            frontPhotoUrl: `data:${frontPhoto.mimetype};base64,${frontPhoto.buffer.toString('base64')}`,
            backPhotoUrl: `data:${backPhoto.mimetype};base64,${backPhoto.buffer.toString('base64')}`,
            profileOnePhotoUrl: `data:${profileOnePhoto.mimetype};base64,${profileOnePhoto.buffer.toString('base64')}`,
            profileTwoPhotoUrl: `data:${profileTwoPhoto.mimetype};base64,${profileTwoPhoto.buffer.toString('base64')}`,
        });
    }
};
exports.ChecksController = ChecksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/photo/:type'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('type')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ChecksController.prototype, "getPhoto", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
        { name: 'profileOnePhoto', maxCount: 1 },
        { name: 'profileTwoPhoto', maxCount: 1 },
    ], {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 15 * 1024 * 1024,
        },
        fileFilter: (_, file, cb) => {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            const isAllowedImage = file.mimetype.startsWith('image/') && ALLOWED_EXT.includes(ext);
            if (!isAllowedImage) {
                cb(new common_1.BadRequestException('allowed image files: JPG, JPEG, PNG, HEIC, HEIF, WEBP'), false);
                return;
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ChecksController.prototype, "create", null);
exports.ChecksController = ChecksController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('checks'),
    __metadata("design:paramtypes", [checks_service_1.ChecksService])
], ChecksController);
//# sourceMappingURL=checks.controller.js.map