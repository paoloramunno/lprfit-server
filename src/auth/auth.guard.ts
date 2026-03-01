import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService, type AuthPayload } from './auth.service';

type RequestWithUser = Request & { user?: AuthPayload };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser & { headers: Record<string, string> }>();

    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('missing Authorization header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('invalid Authorization header format');
    }

    request.user = this.authService.verifyAccessToken(token);
    return true;
  }
}
