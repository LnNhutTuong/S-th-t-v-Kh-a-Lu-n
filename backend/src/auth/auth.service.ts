import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {  PasswordlessLoginDTO } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './types/jwt-payload.type.js';
import type { LoginResponse } from './types/jwt-payload.type.js';
import { getAllowedDomains } from '../utils/regex/email.regex.js';
import { PermissionService } from '../permission/permission.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private permissionService: PermissionService
  ) {}

  async checkEmail(email: string): Promise<boolean>{
    const standardizeEmail = email?.trim().toLowerCase();
    if(!standardizeEmail) {
      throw new UnauthorizedException('Email không được để trống');
    }
    const domain = standardizeEmail.split('@').pop();

    if (!domain || !getAllowedDomains().includes(domain)) {
      const nguoiDung = await this.prisma.nguoiDung.findUnique({
        where: { email: standardizeEmail, deletedAt: null },
      });
      return !!nguoiDung;
    }

    return true;
  }

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

  async getMe(nguoiDungId: string) {
    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: {
        id: nguoiDungId, deletedAt: null
      },
    });

    if (!nguoiDung) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }

    const isAdmin = await this.permissionService.checkAdmin(nguoiDung.id);

    const thanhVienBoPhan = await this.prisma.thanhVienBoPhan.findMany({
      where:{
        nguoiDungId: nguoiDung.id, ngayKetThuc: null,
        boPhan:{
          ngungHoatDong: false
        }
      },
      include: { 
        boPhan: true, 
        vaiTro: { 
          include: { 
            quyenHan: { 
              include: { 
                quyenHan: true 
              }
            } 
          }
        }
      }
    })

    const quyen = thanhVienBoPhan.flatMap((tv) => tv.vaiTro.quyenHan.map((qh) => qh.quyenHan.ma).sort())

    return {
      id: nguoiDung.id,
      email: nguoiDung.email,
      ten: nguoiDung.ten,
      anhDaiDien: nguoiDung.anhDaiDien,
      laAdmin: !!isAdmin,
      boPhan: thanhVienBoPhan.map((tv) => ({
        idBoPhan: tv.boPhanId,
        tenBoPhan: tv.boPhan.ten,
        vaiTro: { 
          ma: tv.vaiTro.ma,
          ten: tv.vaiTro.ten
        },
        capBac: tv.vaiTro.capBac,
        quyen: quyen,
      }))   ,
    }
  }



}
