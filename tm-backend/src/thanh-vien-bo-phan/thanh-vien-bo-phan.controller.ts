import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ThanhVienBoPhanService } from './thanh-vien-bo-phan.service.js';
import { ThemThanhVienBoPhanDto } from './dto/them-thanh-vien-bo-phan.dto.js';
import { SuaThanhVienBoPhanDto } from './dto/sua-thanh-vien-bo-phan.dto.js';
import { UpdateNgayKetThucDto } from './dto/update-ket-thuc.dto.js';

@Controller('thanh-vien-bo-phan')
export class ThanhVienBoPhanController {
  constructor(private readonly thanhVienBoPhanService: ThanhVienBoPhanService) {}
}
