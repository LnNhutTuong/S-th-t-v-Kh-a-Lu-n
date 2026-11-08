import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryVaiTroDto } from './dto/query-vai-tro.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateVaiTroDto } from './dto/update-vai-tro.dto.js';
import { MA_VAI_TRO_ADMIN } from '../permission/constants/quyen-han.constants.js';

@Injectable()
export class VaiTroService {

  constructor(
    private readonly prisma: PrismaService
  ){}

  async findAll(query: QueryVaiTroDto) {
    const dsVaiTro = await this.prisma.vaiTro.findMany({
      where:{
        phamVi: query.phamVi,
        loaiBoPhan: query.loaiBoPhan
      },
      include:{
        _count:{
          select:{
            quyenHan: true
          }
        }
      },
      orderBy: [{ phamVi: 'asc' }, { loaiBoPhan: 'asc' }, { capBac: 'asc' }]
    })

    const count = await this.prisma.vaiTro.count({
      where:{
        phamVi: query.phamVi,
        loaiBoPhan: query.loaiBoPhan
      },
    })

    return {count, dsVaiTro}
  }

  async findOne(vaiTroId: string){
    const vaiTro = await this.prisma.vaiTro.findUnique({
      where:{
        id: vaiTroId
      },
      include:{
        _count:{
          select:{
            quyenHan: true
          }
        },
        quyenHan:{
          include:{
            quyenHan: true
          }
        }
      }
    })

    if(!vaiTro){
      throw new NotFoundException("Không tìm thấy vai trò này");
    } 

    const {quyenHan: dongNoi, ...vaiTroInfor} = vaiTro

    const quyen = dongNoi.map((x) => x.quyenHan).sort((a, b) => a.ma.localeCompare(b.ma));
    
    return {...vaiTroInfor, quyenHan: quyen};

  }

  async saoChepQuyen(dichId: string, nguonId: string){
      if(dichId === nguonId){
        throw new BadRequestException("Không thể sao chép quyền cùng một vai trò");
      }

      const dichVaiTro = await this.prisma.vaiTro.findUnique({
        where:{
          id: dichId
        }
      })

      if(!dichVaiTro){
        throw new NotFoundException("Không thể tìm thấy vai trò này để sao chép quyền");
      }

      if(dichVaiTro.ma === MA_VAI_TRO_ADMIN){
        throw new BadRequestException("Không thể tìm thấy vai trò na`y để sao chép quyền");
      }

      const nguonVaiTro = await this.prisma.vaiTro.findUnique({ where: { id: nguonId } });
      
      if (!nguonVaiTro){
        throw new NotFoundException('Không tìm thấy vai trò nguồn');
      }

      const nguonQuyen = await this.prisma.vaiTroQuyenHan.findMany({
        where:{
          vaiTroId:nguonVaiTro.id
        }
      })

      await this.prisma.$transaction([
        this.prisma.vaiTroQuyenHan.deleteMany({ 
          where: {
             vaiTroId: dichId 
            } 
          }
        ),
        
        this.prisma.vaiTroQuyenHan.createMany({ 
          data: nguonQuyen.map((q) => ({ vaiTroId: dichId, quyenHanId: q.quyenHanId }))
        }),
      ]);

      return this.findOne(dichId);

  }

}
