import { PrismaService } from '../prisma/prisma.service';
type Role = 'ADMIN' | 'USER';
declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
};
type SafeUser = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    phone: string | null;
    birthDate: Date | null;
    role: Role;
};
export type AuthPayload = {
    sub: string;
    email: string;
    role: Role;
    name: string;
    iat: number;
    exp: number;
};
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
    }): Promise<{
        user: SafeUser;
        accessToken: string;
    }>;
    login(input: {
        email: string;
        password: string;
    }): Promise<{
        user: SafeUser;
        accessToken: string;
    }>;
    loginAdmin(input: {
        email: string;
        password: string;
    }): Promise<{
        user: SafeUser;
        accessToken: string;
    }>;
    verifyAccessToken(token: string): AuthPayload;
    private hashPassword;
    private verifyPassword;
    private signToken;
    private getSecret;
    private base64url;
}
export {};
