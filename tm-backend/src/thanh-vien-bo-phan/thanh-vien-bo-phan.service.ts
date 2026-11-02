import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ThemThanhVienBoPhanDto } from './dto/them-thanh-vien-bo-phan.dto.js';
import { SuaThanhVienBoPhanDto } from './dto/sua-thanh-vien-bo-phan.dto.js';
import { UpdateNgayKetThucDto } from './dto/update-ket-thuc.dto.js';
import {BoPhanService} from "../bo-phan/bo-phan.service.js"
import { PrismaService } from '../prisma/prisma.service.js';
import { CapBac, PhamViVaiTro } from '../generated/prisma/enums.js';

@Injectable()
export class ThanhVienBoPhanService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly boPhanService: BoPhanService
  ){}

  async add(boPhanId: string, dto: ThemThanhVienBoPhanDto) {
    const boPhan = await this.boPhanService.findOne(boPhanId);

    if(boPhan.ngungHoatDong){
      throw new BadRequestException('Bộ phận này đã ngưng hoạt động');
    }

    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: {id: dto.nguoiDungId, deletedAt: null}
    })
      

    if(!nguoiDung){
      throw new NotFoundException("Không tìm thấy người dùng này");
    }

    //check coi co lam viec tai bo phan nay khong
    const thanhVienDaCo = await this.prisma.thanhVienBoPhan.findUnique({
      where: { nguoiDungId_boPhanId: { nguoiDungId: nguoiDung.id, boPhanId } },
      include:{
        vaiTro: true
      }
    });

    //neu co va dang lam viec
    if (thanhVienDaCo && thanhVienDaCo.ngayKetThuc === null){
      throw new BadRequestException(`Người này đang là ${thanhVienDaCo.vaiTro.ten} của bộ phận này`);
    }

    const vaiTro = await this.prisma.vaiTro.findUnique({
      where:{id: dto.vaiTroId}
    })

    if(!vaiTro){
      throw new NotFoundException("Không tìm thấy vai trò này");
    }

    //check vai tro co phu hop voi bo phan khong
    if (vaiTro.phamVi !== PhamViVaiTro.BO_PHAN || vaiTro.loaiBoPhan !== boPhan.loai){
      throw new BadRequestException(`Vai trò này không phù hợp với bộ phận hiện tại `)
    }

    //check xem cai vai tro do dang co bao nhieu nguoi giu trong bo phan nay, va chua bi xoa
    const checkSoLuongNguoiDangGiuVaiTro = await this.prisma.thanhVienBoPhan.count({
      where:{
          boPhanId,
          vaiTroId: vaiTro.id,
          ngayKetThuc: null
      }
    })

    if(vaiTro.soLuongToiDa !== null && checkSoLuongNguoiDangGiuVaiTro >= vaiTro.soLuongToiDa){
      throw new BadRequestException(`Đã có ${checkSoLuongNguoiDangGiuVaiTro}/${vaiTro.soLuongToiDa} người giữ vai trò ${vaiTro.ten}`)
    }

    if(!vaiTro.capBac){
      throw new BadRequestException("Vai trò này không có cấp bậc")
    }      

    const duLieu = {vaiTroId: vaiTro.id, capBac: vaiTro.capBac, ngayThamGia: dto.ngayThamGia ?? new Date(), ngayKetThuc: null};

    if (thanhVienDaCo){
      return this.prisma.thanhVienBoPhan.update({
        where: { nguoiDungId_boPhanId: { nguoiDungId: nguoiDung.id, boPhanId } }, 
        data: duLieu 
      });
    }

    return this.prisma.thanhVienBoPhan.create({
      data: { ...duLieu, nguoiDungId: nguoiDung.id, boPhanId } 
    });
  }

  findAll() {
    return `This action returns all thanhVienBoPhan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} thanhVienBoPhan`;
  }

  // update(id: number, updateThanhVienBoPhanDto: UpdateThanhVienBoPhanDto) {
  //   return `This action updates a #${id} thanhVienBoPhan`;
  // }

  remove(id: number) {
    return `This action removes a #${id} thanhVienBoPhan`;
  }
}
