import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    birthDate: string;
  }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password?.trim();
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const phone = input.phone?.trim();
    const birthDateRaw = input.birthDate?.trim();

    if (!email || !password || !firstName || !lastName || !phone || !birthDateRaw) {
      throw new BadRequestException(
        'email, password, firstName, lastName, phone and birthDate are required',
      );
    }

    if (password.length < 6) {
      throw new BadRequestException('password must be at least 6 characters');
    }

    const birthDate = new Date(`${birthDateRaw}T00:00:00.000Z`);
    if (Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException('invalid birthDate format, expected YYYY-MM-DD');
    }

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException('email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone,
        birthDate,
        role: Role.USER,
        passwordHash: this.hashPassword(password),
      },
    });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      birthDate: user.birthDate,
      role: user.role,
    };

    return {
      user: safeUser,
      accessToken: this.signToken(safeUser),
    };
  }

  async login(input: { email: string; password: string }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password?.trim();

    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('invalid credentials');
    }

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      birthDate: user.birthDate,
      role: user.role,
    };

    return {
      user: safeUser,
      accessToken: this.signToken(safeUser),
    };
  }

  async loginAdmin(input: { email: string; password: string }) {
    const result = await this.login(input);
    if (result.user.role !== Role.ADMIN) {
      throw new UnauthorizedException('admin access required');
    }

    return result;
  }

  verifyAccessToken(token: string): AuthPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac('sha256', this.getSecret())
      .update(unsignedToken)
      .digest('base64url');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('invalid token signature');
    }

    let payload: AuthPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AuthPayload;
    } catch {
      throw new UnauthorizedException('invalid token payload');
    }

    if (!payload.sub || !payload.email || !payload.role || !payload.exp) {
      throw new UnauthorizedException('invalid token claims');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new UnauthorizedException('token expired');
    }

    return payload;
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;

    const hashBuffer = Buffer.from(key, 'hex');
    const compareBuffer = scryptSync(password, salt, 64);

    if (hashBuffer.length !== compareBuffer.length) return false;
    return timingSafeEqual(hashBuffer, compareBuffer);
  }

  private signToken(user: SafeUser) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const encodedHeader = this.base64url(JSON.stringify(header));
    const encodedPayload = this.base64url(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', this.getSecret())
      .update(unsignedToken)
      .digest('base64url');

    return `${unsignedToken}.${signature}`;
  }

  private getSecret() {
    return process.env.JWT_SECRET || 'lprfit-dev-secret-change-me';
  }

  private base64url(value: string) {
    return Buffer.from(value, 'utf8').toString('base64url');
  }
}
