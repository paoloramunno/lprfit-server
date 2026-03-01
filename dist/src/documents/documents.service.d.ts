import { PrismaService } from '../prisma/prisma.service';
type Role = 'ADMIN' | 'USER';
declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
};
type DocumentType = 'WORKOUT_PDF' | 'DIET_PDF' | 'MEDICAL_CERT_PDF' | 'BODY_CHECK_PDF';
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
export {};
