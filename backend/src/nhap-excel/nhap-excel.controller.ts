import { Controller, Get, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { NhapExcelService } from './nhap-excel.service.js';
import { LoaiNhapExcel } from '../generated/prisma/enums.js';
import { AdminGuard } from '../permission/guards/permission-admin.guard.js';
import { StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@Controller('nhap-excel')
export class NhapExcelController {
  constructor(private readonly nhapExcelService: NhapExcelService) {}

  @UseGuards(AdminGuard)
  @Get('mau/:loai')
  async getMau(@Param('loai') loai:LoaiNhapExcel){
    const {tenFile, buffer} = await this.nhapExcelService.layMau(loai);
    return new StreamableFile(buffer, 
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        disposition: `attachment; filename="${tenFile}"` });
  }

  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @Post(':loai/xem-truoc')
  async xemTruoc(@Param('loai') loai: string, @UploadedFile() file: Express.Multer.File, @Req() req: any){
    const loaiHopLe = this.nhapExcelService.KiemTraLoai(loai);
    const tenFile = Buffer.from(file.originalname, 'latin1').toString('utf8');
    return this.nhapExcelService.XemTruoc(loaiHopLe, req.user.id, tenFile, file.buffer);
  }

  @UseGuards(AdminGuard)
  @Post('phien/:id/duyet')
  async Duyet(@Param('id') id: string, @Req() req: any){
    return this.nhapExcelService.Duyet(id, req.user.id);
  }

  @UseGuards(AdminGuard)
  @Post('phien/:id/huy')
  async Huy(@Param('id') id: string, @Req() req: any){
    return this.nhapExcelService.Huy(id, req.user.id);
  }




}

