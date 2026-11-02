import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoPhanDto } from './dto/create-bo-phan.dto.js';
import { UpdateBoPhanDto } from './dto/update-bo-phan.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CHA_HOP_LE } from '../permission/constants/quyen-han.constants.js';
import { LoaiBoPhan, NhomDonVi } from '../generated/prisma/enums.js';
import { BoPhan, Prisma } from '../generated/prisma/client.js';
import { UpdateStatusBoPhanDto } from './dto/update-status-bo-phan.dto.js';

@Injectable()
export class BoPhanService {

  constructor(private readonly prisma: PrismaService) {}

  // check cha
  private checkBoPhanCha(loai: LoaiBoPhan, boPhanCha: BoPhan | null){
    
    if(loai === LoaiBoPhan.BAN_GIAM_HIEU){
      return;
    }

    if(!boPhanCha){
      throw new BadRequestException('Bộ phận này phải có bộ phận cha');
    }

    if(boPhanCha.ngungHoatDong){
      throw new BadRequestException('Bộ phân cha đã ngưng hoạt động');
    }

    if (!CHA_HOP_LE[loai].includes(boPhanCha.loai)){
        throw new BadRequestException(`${loai} không thể nằm dưới ${boPhanCha.loai}`);
    }
  }

  // tu bo phan => nhom
  private setNhom(loai: LoaiBoPhan, boPhanCha: BoPhan | null, nhomGui?: NhomDonVi | null){
    
    if(loai === LoaiBoPhan.BAN_GIAM_HIEU){
      return;
    }

    if(loai === LoaiBoPhan.KHOA){
      return NhomDonVi.DAO_TAO
    }

    if(loai === LoaiBoPhan.BO_MON){
      return boPhanCha?.nhom ?? NhomDonVi.DAO_TAO
    }

    if(loai === LoaiBoPhan.PHONG || loai === LoaiBoPhan.THU_VIEN){
      return NhomDonVi.CHUC_NANG;
    }

    return nhomGui ?? NhomDonVi.SU_NGHIEP;   // vien, truong, trung tam

  }

  async create(dto: CreateBoPhanDto) {
    const ma = dto.ma.trim().toUpperCase();  

    if(dto.loai === LoaiBoPhan.BAN_GIAM_HIEU){
      if(dto.boPhanChaId){
        throw new BadRequestException('Ban Giám Hiệu là gốc, không thể có bộ phận cha');
      }

      const isExist = await this.prisma.boPhan.findFirst({
        where: {
          loai: LoaiBoPhan.BAN_GIAM_HIEU
        }
      })

      if(isExist){
        throw new BadRequestException('Đã có Ban Giám Hiệu');
      }
    }

    const boPhanCha = dto.boPhanChaId ? await this.prisma.boPhan.findUnique({
      where: {id: dto.boPhanChaId}
    }) : null

    if(dto.boPhanChaId && !boPhanCha){
      throw new NotFoundException("Không tìm thấy bộ phận cha");
    }

    this.checkBoPhanCha(dto.loai, boPhanCha);
    
    try{
      return await this.prisma.boPhan.create({
        data: {
          ma,
          ten: dto.ten.trim(),
          loai: dto.loai,
          nhom: this.setNhom(dto.loai, boPhanCha, dto.nhom),
          boPhanChaId: boPhanCha?.id ?? null,
          thongTinThem: dto.thongTinThem,
        }
      })
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException(`Mã ${ma} đã tồn tại`);
      throw e;
    }

  }

  async findAll(baoGomDungHoatDong = false) {
    const dsBoPhan = await this.prisma.boPhan.findMany({
      where:
        baoGomDungHoatDong ? {} : {ngungHoatDong: false},
        orderBy: [{loai: 'asc'}, {ten: 'asc'}]
    });

    const nut = new Map(dsBoPhan.map((b) => [b.id, { ...b, con: [] as any[] }]));
    const goc: any[] = [];
    for (const n of nut.values()) {
      const cha = n.boPhanChaId ? nut.get(n.boPhanChaId) : undefined;
      (cha ? cha.con : goc).push(n);   // có cha thì bỏ vào con của cha, không thì là gốc
    }
    return goc;
  }

  async findOne(id: string) {
    const boPhan = await this.prisma.boPhan.findUnique({
      where:{
        id
      }
    })

    if(!boPhan){
      throw new NotFoundException('Không tìm thấy bộ phận này');
    } 

    return boPhan;

  }

  private async kiemTraVongLap(id: string, chaMoiId: string) {
    const ds = await this.prisma.boPhan.findMany({ select: { id: true, boPhanChaId: true } });
    const chaCua = new Map(ds.map((b) => [b.id, b.boPhanChaId]));
    let dem = 0;
    for (let x: string | null = chaMoiId; x; x = chaCua.get(x) ?? null) {
      if (x === id) throw new BadRequestException('Không thể chuyển vào chính nó hoặc vào bộ phận con của nó');
      if (++dem > 50) break;   // phòng dữ liệu hỏng làm vòng lặp chạy mãi
    }
  }

  async update(id: string, dto: UpdateBoPhanDto) {
    const boPhanHienTai = await this.findOne(id);
    
    const data: Prisma.BoPhanUpdateInput = {};

    if(dto.ten){
      data.ten = dto.ten.trim();
    }

    if(dto.thongTinThem){
      data.thongTinThem = dto.thongTinThem;
    }

    if(dto.boPhanChaId && dto.boPhanChaId !== boPhanHienTai.boPhanChaId){
      if(dto.boPhanChaId === LoaiBoPhan.BAN_GIAM_HIEU){
        throw new BadRequestException("Ban Giám Hiệu không có bộ phận cha");
      }

      if(dto.boPhanChaId === boPhanHienTai.id){
        throw new BadRequestException("Không thể tự làm cha được");
      }

      const boPhanCha = await this.findOne(dto.boPhanChaId);
      this.checkBoPhanCha(boPhanHienTai.loai, boPhanCha)
      await this.kiemTraVongLap(id, boPhanCha.id);

      data.boPhanCha = {connect: {id: boPhanCha.id}};
      data.nhom = this.setNhom(boPhanHienTai.loai, boPhanCha, dto.nhom ?? boPhanHienTai.nhom);
    }else if (dto.nhom){
      data.nhom = this.setNhom(boPhanHienTai.loai, null, dto.nhom);
    }

    return this.prisma.boPhan.update({
      where: {id},
      data
    })

  }

  async updateTrangThai(id: string, dto: UpdateStatusBoPhanDto) {
    const boPhan = await this.findOne(id);

    if(dto.ngungHoatDong){
      if(boPhan.loai === LoaiBoPhan.BAN_GIAM_HIEU){
        throw new BadRequestException("Không thể ngưng hoạt động Ban Giám Hiệu");
      }

      const boPhanCon = await this.prisma.boPhan.count({
        where: {boPhanChaId: boPhan.id, ngungHoatDong: false}
      })
      
      if(boPhanCon > 0) throw new BadRequestException(`Còn ${boPhanCon} bộ phận con đang hoạt động, hãy ngưng chúng trước`);
    }else if (boPhan.boPhanChaId){
      const boPhanCha = await this.findOne(boPhan.boPhanChaId);
      if(boPhanCha.ngungHoatDong){
        throw new BadRequestException('Bộ phận cha đang ngưng hoạt động, hãy kích hoạt lại bộ phận cha trước');
      }
    }
    
    return this.prisma.boPhan.update({ where: { id }, data: { ngungHoatDong: dto.ngungHoatDong } });
  }

}
