import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QuyenHanService {

  constructor(
    private readonly prisma: PrismaService
  ){}

  async findAll() {
    const dsQuyenHang = await this.prisma.quyenHan.findMany({
      orderBy:{
        ma :'asc'
      }
    });

    const count = await this.prisma.quyenHan.count()

    return {count, dsQuyenHang };
  }

}
