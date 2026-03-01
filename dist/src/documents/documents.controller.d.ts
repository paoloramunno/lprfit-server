import { DocumentsService } from './documents.service';
type Role = 'ADMIN' | 'USER';
type RequestUser = {
    user: {
        sub: string;
        role: Role;
    };
};
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    list(req: RequestUser, userId?: string): Promise<({
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
    upload(req: RequestUser, file: {
        mimetype: string;
        buffer: Buffer;
    } | undefined, body: {
        docType: string;
        userId?: string;
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
}
export {};
