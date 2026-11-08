import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { QuyenHanService } from './quyen-han.service.js';
import { CreateQuyenHanDto } from './dto/create-quyen-han.dto.js';
import { UpdateQuyenHanDto } from './dto/update-quyen-han.dto.js';
import { AdminGuard } from '../permission/guards/permission-admin.guard.js';

@UseGuards(AdminGuard)
@Controller('quyen-han')
export class QuyenHanController {
  constructor(private readonly quyenHanService: QuyenHanService) {}

  @Get()
  findAll() {
    return this.quyenHanService.findAll();
  }

}
