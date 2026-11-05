import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
import { BoPhanService } from './bo-phan.service.js';
import { CreateBoPhanDto } from './dto/create-bo-phan.dto.js';
import { UpdateBoPhanDto } from './dto/update-bo-phan.dto.js';
import { UpdateStatusBoPhanDto } from './dto/update-status-bo-phan.dto.js';
import { ThemThanhVienBoPhanDto } from '../thanh-vien-bo-phan/dto/them-thanh-vien-bo-phan.dto.js';
import { ThanhVienBoPhanService } from '../thanh-vien-bo-phan/thanh-vien-bo-phan.service.js';
import { UpdateNgayKetThucDto } from '../thanh-vien-bo-phan/dto/update-ket-thuc.dto.js';
import { SuaThanhVienBoPhanDto } from '../thanh-vien-bo-phan/dto/sua-thanh-vien-bo-phan.dto.js';
import { RequirePermission } from '../permission/decorators/permission.decoration.js';
import { QUYEN } from '../permission/constants/quyen-han.constants.js';

@Controller('bo-phan')
export class BoPhanController {
  constructor(private readonly boPhanService: BoPhanService, private readonly thanhVienBoPhanService: ThanhVienBoPhanService) {}

  @Post()
  create(@Body() createBoPhanDto: CreateBoPhanDto) {
    return this.boPhanService.create(createBoPhanDto);
  }

  @Get() 
  findAll(@Query('baoGomDungHoatDong') b?: string) { 
    return this.boPhanService.findAll(b === 'true'); 
  }

  @Get('thieu-lanh-dao')
  getBoPhanThieuLanhDao(){
    return this.boPhanService.getBoPhanThieuLanhDao();
  }

  @Get(':boPhanId')
  findOne(@Param('boPhanId') id: string) {
    return this.boPhanService.findOne(id);
  }

  @RequirePermission(QUYEN.BO_PHAN_SUA)
  @Patch(':boPhanId')
  update(@Param('boPhanId') id: string, @Body() updateBoPhanDto: UpdateBoPhanDto) {
    return this.boPhanService.update(id, updateBoPhanDto);
  }
  
  @Patch(':boPhanId/ngung-hoat-dong')
  updateTrangThai(@Param('boPhanId') id: string, @Body() UpdateStatusBoPhanDto: UpdateStatusBoPhanDto) {
    return this.boPhanService.updateTrangThai(id, UpdateStatusBoPhanDto)
  }

  @Post('/:boPhanId/thanh-vien')
  addThanhVien(@Param('boPhanId') boPhanId: string, @Body() dto: ThemThanhVienBoPhanDto) {
    return this.thanhVienBoPhanService.add(boPhanId, dto)
  }

  @Get('/:boPhanId/thanh-vien')
  findAllThanhVien(@Param('boPhanId') boPhanId: string, @Query('baoGomDaKetThuc') b?: string) {
    return this.thanhVienBoPhanService.findAll(boPhanId, b === 'true');
  }

  @Patch('/:boPhanId/thanh-vien/:nguoiDungId/ket-thuc')
  updateNgayKetThuc(@Param('boPhanId') boPhanId: string, @Param('nguoiDungId') nguoiDungId: string,@Body() dto: UpdateNgayKetThucDto){
    return this.thanhVienBoPhanService.updateNgayKetThuc(boPhanId, nguoiDungId, dto);
  }

  @Patch('/:boPhanId/thanh-vien/:nguoiDungId')
  updateThanhVien(@Param('boPhanId') boPhanId: string, @Param('nguoiDungId') nguoiDungId: string, @Body() dto: SuaThanhVienBoPhanDto){
    return this.thanhVienBoPhanService.updateThanhVien(boPhanId, nguoiDungId, dto)
  }

}
