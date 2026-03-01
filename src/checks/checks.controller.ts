import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { AuthGuard } from '../auth/auth.guard';
import { ChecksService } from './checks.service';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'];

type RequestUser = {
  user: {
    sub: string;
    role: Role;
  };
};

type UploadedFields = {
  frontPhoto?: Array<{ filename: string }>;
  backPhoto?: Array<{ filename: string }>;
  profileOnePhoto?: Array<{ filename: string }>;
  profileTwoPhoto?: Array<{ filename: string }>;
};

@UseGuards(AuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Get()
  list(@Req() req: RequestUser, @Query('userId') userId?: string) {
    return this.checksService.listForRequester(req.user.sub, req.user.role, userId);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
        { name: 'profileOnePhoto', maxCount: 1 },
        { name: 'profileTwoPhoto', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_, file, cb) => {
            const suffix = `${Date.now()}-${randomUUID()}`;
            cb(null, `${suffix}${extname(file.originalname).toLowerCase() || '.bin'}`);
          },
        }),
        limits: {
          fileSize: 15 * 1024 * 1024,
        },
        fileFilter: (_, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const isAllowedImage = file.mimetype.startsWith('image/') && ALLOWED_EXT.includes(ext);

          if (!isAllowedImage) {
            cb(new BadRequestException('allowed image files: JPG, JPEG, PNG, HEIC, HEIF, WEBP'), false);
            return;
          }

          cb(null, true);
        },
      },
    ),
  )
  create(
    @Req() req: RequestUser,
    @UploadedFiles() files: UploadedFields,
    @Body()
    body: {
      userId?: string;
      workoutsPerWeek: string;
      workoutIssues: string;
      workoutChanges: string;
      stepsOnTarget: string;
      workoutScore: string;
      freeMeals: string;
      nutritionIssues: string;
      nutritionScore: string;
      sleepRegular: string;
      sleepHours: string;
      sleepCompared: string;
      stressHigherThanUsual: string;
      weight: string;
      gluteCircumference: string;
      waistCircumference: string;
      thighCircumference: string;
      muscleMass: string;
      fatMass: string;
      bodyWater: string;
    },
  ) {
    const frontPhoto = files?.frontPhoto?.[0]?.filename;
    const backPhoto = files?.backPhoto?.[0]?.filename;
    const profileOnePhoto = files?.profileOnePhoto?.[0]?.filename;
    const profileTwoPhoto = files?.profileTwoPhoto?.[0]?.filename;

    if (!frontPhoto || !backPhoto || !profileOnePhoto || !profileTwoPhoto) {
      throw new BadRequestException('all 4 photos are required');
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
      frontPhotoUrl: `/uploads/${frontPhoto}`,
      backPhotoUrl: `/uploads/${backPhoto}`,
      profileOnePhotoUrl: `/uploads/${profileOnePhoto}`,
      profileTwoPhotoUrl: `/uploads/${profileTwoPhoto}`,
    });
  }
}
