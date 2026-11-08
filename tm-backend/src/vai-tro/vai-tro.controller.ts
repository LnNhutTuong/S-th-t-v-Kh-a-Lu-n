import { Body, Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { VaiTroService } from './vai-tro.service.js';
import { QueryVaiTroDto } from './dto/query-vai-tro.dto.js';
import { AdminGuard } from '../permission/guards/permission-admin.guard.js';
import { UpdateVaiTroDto } from './dto/update-vai-tro.dto.js';

@Controller('vai-tro')
@UseGuards(AdminGuard)
export class VaiTroController {
  constructor(private readonly vaiTroService: VaiTroService) {}

  @Get()
  findAll(@Query() dto:QueryVaiTroDto) {
    return this.vaiTroService.findAll(dto);
  }

  @Get('/:vaiTroId')
  findOne(@Param('vaiTroId') vaiTroId: string){
    return this.vaiTroService.findOne(vaiTroId)
  }

  @Post('/:vaiTroId/sao-chep-quyen')
  saoChepQuyen(@Param('vaiTroId') vaiTroId: string, @Body() dto: UpdateVaiTroDto){
    return this.vaiTroService.saoChepQuyen(vaiTroId, dto.tuVaiTroId);
  }
}
