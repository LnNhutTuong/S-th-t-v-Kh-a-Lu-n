import { Module, forwardRef } from '@nestjs/common';
import { ThanhVienBoPhanService } from './thanh-vien-bo-phan.service.js';
import { ThanhVienBoPhanController } from './thanh-vien-bo-phan.controller.js';
import { BoPhanModule } from '../bo-phan/bo-phan.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [ThanhVienBoPhanController],
  providers: [ThanhVienBoPhanService],
  exports: [ThanhVienBoPhanService],
  imports: [forwardRef(() => BoPhanModule), PrismaModule],
})
export class ThanhVienBoPhanModule {}
