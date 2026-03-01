import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/auth.guard';
import { DocumentsService } from './documents.service';

type Role = 'ADMIN' | 'USER';

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.heic', '.webp'];

type RequestUser = {
  user: {
    sub: string;
    role: Role;
  };
};

@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  list(@Req() req: RequestUser, @Query('userId') userId?: string) {
    return this.documentsService.listForRequester(req.user.sub, req.user.role, userId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const isPdf =
          file.mimetype === 'application/pdf' ||
          ext === '.pdf';
        const isImage = file.mimetype.startsWith('image/') && ALLOWED_EXT.includes(ext);

        if (!isPdf && !isImage) {
          cb(new BadRequestException('allowed files: PDF, JPG, JPEG, PNG, HEIC, WEBP'), false);
          return;
        }

        cb(null, true);
      },
    }),
  )
  upload(
    @Req() req: RequestUser,
    @UploadedFile() file: { mimetype: string; buffer: Buffer } | undefined,
    @Body() body: { docType: string; userId?: string },
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
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
}
