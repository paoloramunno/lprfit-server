import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';

type Role = 'ADMIN' | 'USER';
const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard) {}

  canActivate(context: ExecutionContext): boolean {
    const isAuthenticated = this.authGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: Role } }>();

    if (request.user?.role !== Role.ADMIN) {
      throw new UnauthorizedException('admin access required');
    }

    return true;
  }
}
