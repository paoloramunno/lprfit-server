import { DocumentType, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForRequester(requesterId: string, requesterRole: Role, userId?: string): Promise<({
        owner: {
            id: string;
            email: string;
            fullName: string;
        };
        uploader: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        docType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        uploadedBy: string;
        expiresAt: Date | null;
    })[]>;
    upload(input: {
        requesterId: string;
        requesterRole: Role;
        docType: DocumentType;
        fileUrl: string;
        targetUserId?: string;
    }): Promise<{
        owner: {
            id: string;
            email: string;
            fullName: string;
        };
        uploader: {
            id: string;
            email: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        docType: import("@prisma/client").$Enums.DocumentType;
        fileUrl: string;
        uploadedBy: string;
        expiresAt: Date | null;
    }>;
    validateDocType(value: string): DocumentType;
}
