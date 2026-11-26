import { Module } from '@nestjs/common';
import { NhapExcelService } from './nhap-excel.service.js';
import { NhapExcelController } from './nhap-excel.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExcelModule } from '../excel/excel.module.js';

@Module({
  imports: [PrismaModule, ExcelModule],
  controllers: [NhapExcelController],
  providers: [NhapExcelService],
  exports: [NhapExcelService],
})
export class NhapExcelModule {}

