import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            fullName: string;
            phone: string | null;
            birthDate: Date | null;
            role: "ADMIN" | "USER";
        };
        accessToken: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            fullName: string;
            phone: string | null;
            birthDate: Date | null;
            role: "ADMIN" | "USER";
        };
        accessToken: string;
    }>;
    loginAdmin(body: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            fullName: string;
            phone: string | null;
            birthDate: Date | null;
            role: "ADMIN" | "USER";
        };
        accessToken: string;
    }>;
}
