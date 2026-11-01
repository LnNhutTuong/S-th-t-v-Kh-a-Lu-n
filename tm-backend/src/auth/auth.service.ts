import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {  PasswordlessLoginDTO } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './types/jwt-payload.type.js';
import type { LoginResponse } from './types/jwt-payload.type.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

    async loginByEmail(dto: PasswordlessLoginDTO ): Promise<LoginResponse> {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        systemRoles: { include: { role: true } },
        workspaceMemberships: {
          where: { workspace: { deletedAt: null } },
          include: {
            role: { select: { name: true } },
            workspace: { select: { id: true, name: true } },
          },
        },
      },
    });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.email.split('@')[0],
        password: '',
      },
      include: {
        systemRoles: { include: { role: true } },
        workspaceMemberships: {
          where: { workspace: { deletedAt: null } },
          include: {
            role: { select: { name: true } },
            workspace: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        email: user.email,
        name: user.name,
        roles: {
          system: user.systemRoles.map((ur) => ur.role.name),
          workspace: user.workspaceMemberships.map((m) => ({
            id: m.workspace.id,
            workspaceName: m.workspace.name,
            role: m.role.name,
          })),
        },
      },
    };
  }

  // async getProfile(dto: ProfileDTO) {
  //   const user = this.prisma.user.findUnique({
  //     where: {
  //       email: dto.email,
  //     },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid email or password');
  //   }

  //   return {
  //     email: dto.email,
  //     name: dto.name,
  //   };
  // }



}
