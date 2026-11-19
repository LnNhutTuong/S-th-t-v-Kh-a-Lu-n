import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ThemThanhVienBoPhanDto } from './dto/them-thanh-vien-bo-phan.dto.js';
import { SuaThanhVienBoPhanDto } from './dto/sua-thanh-vien-bo-phan.dto.js';
import { UpdateNgayKetThucDto } from './dto/update-ket-thuc.dto.js';
import { BoPhanService } from "../bo-phan/bo-phan.service.js"
import { PrismaService } from '../prisma/prisma.service.js';
import { CapBac, PhamViVaiTro } from '../generated/prisma/enums.js';
import { dot } from 'node:test/reporters';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ThanhVienBoPhanService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly boPhanService: BoPhanService
  ) { }

  async add(boPhanId: string, dto: ThemThanhVienBoPhanDto) {

    const boPhan = await this.boPhanService.findOne(boPhanId);

    if (boPhan.ngungHoatDong) {
      throw new BadRequestException('Bộ phận này đã ngưng hoạt động');
    }

    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { id: dto.nguoiDungId, deletedAt: null }
    })


    if (!nguoiDung) {
      throw new NotFoundException("Không tìm thấy người dùng này");
    }

    //check coi co lam viec tai bo phan nay khong
    const thanhVienDaCo = await this.prisma.thanhVienBoPhan.findUnique({
      where: { nguoiDungId_boPhanId: { nguoiDungId: nguoiDung.id, boPhanId } },
      include: {
        vaiTro: true
      }
    });

    //neu co va dang lam viec
    if (thanhVienDaCo && thanhVienDaCo.ngayKetThuc === null) {
      throw new BadRequestException(`Người này đang là ${thanhVienDaCo.vaiTro.ten} của bộ phận này`);
    }

    const vaiTro = await this.prisma.vaiTro.findUnique({
      where: { id: dto.vaiTroId }
    })

    if (!vaiTro) {
      throw new NotFoundException("Không tìm thấy vai trò này");
    }

    //check vai tro co phu hop voi bo phan khong
    if (vaiTro.phamVi !== PhamViVaiTro.BO_PHAN || vaiTro.loaiBoPhan !== boPhan.loai) {
      throw new BadRequestException(`Vai trò này không phù hợp với bộ phận hiện tại `)
    }

    //check xem cai vai tro do dang co bao nhieu nguoi giu trong bo phan nay, va chua bi xoa
    // const checkSoLuongNguoiDangGiuVaiTro = await this.prisma.thanhVienBoPhan.count({
    //   where:{
    //       boPhanId,
    //       vaiTroId: vaiTro.id,
    //       ngayKetThuc: null
    //   }
    // })

    // if(vaiTro.soLuongToiDa !== null && checkSoLuongNguoiDangGiuVaiTro >= vaiTro.soLuongToiDa){
    //   throw new BadRequestException(`Đã có ${checkSoLuongNguoiDangGiuVaiTro}/${vaiTro.soLuongToiDa} người giữ vai trò ${vaiTro.ten}`)
    // }

    if (!vaiTro.capBac) {
      throw new BadRequestException("Vai trò này không có cấp bậc")
    }

    const duLieu = { vaiTroId: vaiTro.id, capBac: vaiTro.capBac, ngayThamGia: dto.ngayThamGia ?? new Date(), ngayKetThuc: null };

    if (thanhVienDaCo) {
      return this.prisma.thanhVienBoPhan.update({
        where: { nguoiDungId_boPhanId: { nguoiDungId: nguoiDung.id, boPhanId } },
        data: duLieu
      });
    }

    try {
      return await  this.prisma.thanhVienBoPhan.create({
        data: { ...duLieu, nguoiDungId: nguoiDung.id, boPhanId }
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Bộ phận này đã có trưởng')
      }
    }

  }

  async findAll(boPhanId: string, baoGomDaKetThuc = false) {
    await this.boPhanService.findOne(boPhanId);

    return this.prisma.thanhVienBoPhan.findMany({
      where: {
        boPhanId,
        ...(baoGomDaKetThuc ? {} : { ngayKetThuc: null })
      },
      omit: {
        nguoiDungId: true,
        vaiTroId: true,
      },
      include: {
        nguoiDung: { select: { id: true, email: true, ten: true } },
        vaiTro: { select: { id: true, ten: true } }
      },
      orderBy: { capBac: 'asc' }
    });
  }

  /* hi ngày nghỉ cho một người ở một bộ phận. 
    Không xóa dòng, chỉ đặt ngayKetThuc, để còn lịch sử và 
    để sau này người đó quay lại được.*/
  async updateNgayKetThuc(boPhanId: string, nguoiDungId: string, dto: UpdateNgayKetThucDto) {

    const ngay = dto?.ngayKetThuc ?? new Date();

    const thanhVienBoPhan = await this.prisma.thanhVienBoPhan.findUnique({
      where: {
        nguoiDungId_boPhanId: { nguoiDungId, boPhanId }
      }
    })

    if (!thanhVienBoPhan) {
      throw new NotFoundException("Không tìm thấy người này trong bộ phận");
    }

    if (thanhVienBoPhan.ngayKetThuc) {
      throw new BadRequestException("Người này đã không còn làm trong bộ phận này nữa");
    }

    if (
      ngay.toISOString().slice(0, 10) <
      thanhVienBoPhan.ngayThamGia.toISOString().slice(0, 10)
    ) {
      throw new BadRequestException(
        'Ngày kết thúc không thể trước ngày tham gia',
      );
    }

    if (ngay > new Date()) {
      throw new BadRequestException("Ngày kết thúc không thể là ngày của tương lai");
    }

    return this.prisma.thanhVienBoPhan.update({
      where: {
        nguoiDungId_boPhanId: { nguoiDungId, boPhanId }
      },
      data: {
        ngayKetThuc: ngay
      }
    })
  }

  async updateThanhVien(boPhanId: string, nguoiDungId: string, dto: SuaThanhVienBoPhanDto) {
    const thanhVienBoPhan = await this.prisma.thanhVienBoPhan.findUnique({
      where: {
        nguoiDungId_boPhanId: { nguoiDungId, boPhanId }
      },
      include: {
        boPhan: true
      }
    })

    if (!thanhVienBoPhan) {
      throw new NotFoundException("Người này không có trong bộ phận");
    }

    if (thanhVienBoPhan.ngayKetThuc) {
      throw new BadRequestException("Người này không còn làm việc trong bộ phận nữa");
    }

    //Luyenej tapaj thois quen dungwj tungwf data truowsc khi thwucj hienj caapj nhaatj
    const data: Prisma.ThanhVienBoPhanUncheckedUpdateInput = {};

    if (dto.ngayThamGia) {
      data.ngayThamGia = dto.ngayThamGia;
    }

    let vaiTro;

    if (dto.vaiTroId && dto.vaiTroId !== thanhVienBoPhan.vaiTroId) {

      vaiTro = await this.prisma.vaiTro.findUnique({
        where: { id: dto.vaiTroId }
      })

      if (!vaiTro) {
        throw new NotFoundException("Không tìm thấy vai trò này");
      }

      //check pham vi va loai vai tro
      if (vaiTro.phamVi !== PhamViVaiTro.BO_PHAN || vaiTro.loaiBoPhan !== thanhVienBoPhan.boPhan.loai) {
        throw new BadRequestException(`Vai trò này không phù hợp với bộ phận hiện tại `)
      }

      //check xem cai vai tro do dang co bao nhieu nguoi giu trong bo phan nay, va chua bi xoa
      const checkSoLuongNguoiDangGiuVaiTro = await this.prisma.thanhVienBoPhan.count({
        where:
        {
          boPhanId, vaiTroId: vaiTro.id, ngayKetThuc: null,
          nguoiDungId: { not: nguoiDungId }
        }
      })

      if (vaiTro.soLuongToiDa !== null && checkSoLuongNguoiDangGiuVaiTro >= vaiTro.soLuongToiDa) {
        throw new BadRequestException(`Đã có ${checkSoLuongNguoiDangGiuVaiTro}/${vaiTro.soLuongToiDa} người giữ vai trò ${vaiTro.ten}`)
      }

      if (!vaiTro.capBac) {
        throw new BadRequestException("Vai trò này không có cấp bậc")
      }

      data.vaiTroId = vaiTro.id;
      data.capBac = vaiTro.capBac;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Không có thay đổi nào để cập nhật');
    }
    try{
        return await this.prisma.thanhVienBoPhan.update({
      where: {
        nguoiDungId_boPhanId: { nguoiDungId, boPhanId }
      },
      data
      })
    }catch(e: any){
      if (e.code === 'P2002') {
        throw new BadRequestException('Bộ phận này đã có trưởng')
      }
    }
    

  }

}
