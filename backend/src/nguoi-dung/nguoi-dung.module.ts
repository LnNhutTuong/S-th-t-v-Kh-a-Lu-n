import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service.js';
import { NguoiDungController } from './nguoi-dung.controller.js';
import { NhapExcelModule } from '../nhap-excel/nhap-excel.module.js';
import { NguoiDungImporter } from './nguoi-dung.importer.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [NhapExcelModule],
  controllers: [NguoiDungController],
  providers: [NguoiDungService, NguoiDungImporter, PrismaService],
})
export class NguoiDungModule {}
