import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NhapExcelService } from './nhap-excel.service.js';


@Controller('nhap-excel')
export class NhapExcelController {
  constructor(private readonly nhapExcelService: NhapExcelService) {}

  
}

