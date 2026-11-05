import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {  PasswordlessLoginDTO } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './types/jwt-payload.type.js';
import type { LoginResponse } from './types/jwt-payload.type.js';
import { getAllowedDomains } from '../utils/regex/email.regex.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginByEmail(dto: PasswordlessLoginDTO ): Promise<LoginResponse> {

    const email = dto.email.trim().toLowerCase();

    let nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { email },
      include: {
        vaiTroHeThong: { include: { vaiTro: true } },
        thanhVienBoPhan: {
          include: {
            vaiTro: { select: { ten: true } },
            boPhan: { select: { id: true, ten: true } },
          },
        },
      },
    });

    if(nguoiDung?.deletedAt){
      throw new ForbiddenException('Tài khoản của bạn đã bị xóa, vui lòng liên hệ quản trị viên để được hỗ trợ')
    }

    if (!nguoiDung) {

      //lái cái đuôi sau email bằng split cho dễ hehe
      const domain = email.split('@').pop();

      if (!domain || !getAllowedDomains().includes(domain)) {
        throw new ForbiddenException('Email không hợp lệ');
      }

      nguoiDung = await this.prisma.nguoiDung.create({
        data: {
          email,
          ten: email.split('@')[0],
        },
        include: {
          vaiTroHeThong: { include: { vaiTro: true } },
          thanhVienBoPhan: {
            include: {
              vaiTro: { select: { ten: true } },
              boPhan: { select: { id: true, ten: true } },
            },
          },
        },
      });
    }

    const payload: JwtPayload = {
      sub: nguoiDung.id,
      email: nguoiDung.email,
      ten: nguoiDung.ten,
    };

    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      nguoiDung: {
        email: nguoiDung.email,
        ten: nguoiDung.ten,
        vaiTro: {
          heThong: nguoiDung.vaiTroHeThong.map((ur) => ur.vaiTro.ten),
          boPhan: nguoiDung.thanhVienBoPhan.map((m) => ({
            idBoPhan: m.boPhan.id,
            tenBoPhan: m.boPhan.ten,
            vaiTro: m.vaiTro.ten,
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
