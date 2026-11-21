import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service.js';
import { NguoiDungController } from './nguoi-dung.controller.js';

@Module({
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
})
export class NguoiDungModule {}
