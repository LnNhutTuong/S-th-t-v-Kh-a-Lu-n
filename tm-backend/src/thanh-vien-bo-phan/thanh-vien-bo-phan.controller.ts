import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ThanhVienBoPhanService } from './thanh-vien-bo-phan.service.js';
import { ThemThanhVienBoPhanDto } from './dto/them-thanh-vien-bo-phan.dto.js';
import { SuaThanhVienBoPhanDto } from './dto/sua-thanh-vien-bo-phan.dto.js';
import { UpdateNgayKetThucDto } from './dto/update-ket-thuc.dto.js';

@Controller('thanh-vien-bo-phan')
export class ThanhVienBoPhanController {
  constructor(private readonly thanhVienBoPhanService: ThanhVienBoPhanService) {}

  // @Post(':boPhanId')
  // create(@Param('boPhanId') boPhanId: string, @Body() dto: ThemThanhVienBoPhanDto) {
  //   return this.thanhVienBoPhanService.add(boPhanId, dto);
  // }

  @Get()
  findAll() {
    return this.thanhVienBoPhanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thanhVienBoPhanService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateThanhVienBoPhanDto: UpdateThanhVienBoPhanDto) {
  //   return this.thanhVienBoPhanService.update(+id, updateThanhVienBoPhanDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thanhVienBoPhanService.remove(+id);
  }
}
