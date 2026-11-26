import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BoPhanController } from './bo-phan.controller.js';
import { BoPhanService } from './bo-phan.service.js';
import { BoPhanImporter } from './bo-phan.importer.js';
import { ThanhVienBoPhanModule } from '../thanh-vien-bo-phan/thanh-vien-bo-phan.module.js';
import { PermissionModule } from '../permission/permission.module.js';
import { NhapExcelModule } from '../nhap-excel/nhap-excel.module.js';

@Module({
  controllers: [BoPhanController],
  providers: [BoPhanService, BoPhanImporter, PrismaService],
  exports: [BoPhanService],
  imports: [ThanhVienBoPhanModule, PermissionModule, NhapExcelModule]
})
export class BoPhanModule {}
