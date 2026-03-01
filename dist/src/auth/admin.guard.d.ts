import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
export declare class AdminGuard implements CanActivate {
    private readonly authGuard;
    constructor(authGuard: AuthGuard);
    canActivate(context: ExecutionContext): boolean;
}
