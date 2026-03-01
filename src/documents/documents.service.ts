import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Role = 'ADMIN' | 'USER';
const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

type DocumentType =
  | 'WORKOUT_PDF'
  | 'DIET_PDF'
  | 'MEDICAL_CERT_PDF'
  | 'BODY_CHECK_PDF';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForRequester(requesterId: string, requesterRole: Role, userId?: string) {
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

  async upload(input: {
    requesterId: string;
    requesterRole: Role;
    docType: DocumentType;
    fileUrl: string;
    targetUserId?: string;
  }) {
    const ownerUserId = input.requesterRole === Role.ADMIN && input.targetUserId
      ? input.targetUserId
      : input.requesterId;

    if (input.requesterRole !== Role.ADMIN && input.targetUserId && input.targetUserId !== input.requesterId) {
      throw new UnauthorizedException('user can upload documents only for self');
    }

    const owner = await this.prisma.user.findUnique({ where: { id: ownerUserId } });
    if (!owner) {
      throw new NotFoundException('target user not found');
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

  validateDocType(value: string): DocumentType {
    if (
      value !== 'WORKOUT_PDF' &&
      value !== 'DIET_PDF' &&
      value !== 'MEDICAL_CERT_PDF' &&
      value !== 'BODY_CHECK_PDF'
    ) {
      throw new BadRequestException('invalid docType');
    }

    return value;
  }
}
