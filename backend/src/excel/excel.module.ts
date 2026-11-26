import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service.js';
import { ExcelController } from './excel.controller.js';

@Module({
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
