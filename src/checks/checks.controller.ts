import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { ChecksService } from './checks.service';

type Role = 'ADMIN' | 'USER';

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'];

type RequestUser = {
  user: {
    sub: string;
    role: Role;
  };
};

type UploadedFields = {
  frontPhoto?: Array<{ mimetype: string; buffer: Buffer }>;
  backPhoto?: Array<{ mimetype: string; buffer: Buffer }>;
  profileOnePhoto?: Array<{ mimetype: string; buffer: Buffer }>;
  profileTwoPhoto?: Array<{ mimetype: string; buffer: Buffer }>;
};

@UseGuards(AuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Get()
  list(@Req() req: RequestUser, @Query('userId') userId?: string) {
    return this.checksService.listForRequester(req.user.sub, req.user.role, userId);
  }

  @Get(':id/photo/:type')
  async getPhoto(
    @Req() req: RequestUser,
    @Param('id') id: string,
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const normalized = type.toLowerCase();
    if (
      normalized !== 'front' &&
      normalized !== 'back' &&
      normalized !== 'profile1' &&
      normalized !== 'profile2'
    ) {
      throw new BadRequestException('photo type must be front, back, profile1 or profile2');
    }

    const photo = await this.checksService.getPhotoForRequester(
      req.user.sub,
      req.user.role,
      id,
      normalized as 'front' | 'back' | 'profile1' | 'profile2',
    );

    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.send(photo.buffer);
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
        storage: memoryStorage(),
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
    const frontPhoto = files?.frontPhoto?.[0];
    const backPhoto = files?.backPhoto?.[0];
    const profileOnePhoto = files?.profileOnePhoto?.[0];
    const profileTwoPhoto = files?.profileTwoPhoto?.[0];

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
      frontPhotoUrl: `data:${frontPhoto.mimetype};base64,${frontPhoto.buffer.toString('base64')}`,
      backPhotoUrl: `data:${backPhoto.mimetype};base64,${backPhoto.buffer.toString('base64')}`,
      profileOnePhotoUrl: `data:${profileOnePhoto.mimetype};base64,${profileOnePhoto.buffer.toString('base64')}`,
      profileTwoPhotoUrl: `data:${profileTwoPhoto.mimetype};base64,${profileTwoPhoto.buffer.toString('base64')}`,
    });
  }
}
