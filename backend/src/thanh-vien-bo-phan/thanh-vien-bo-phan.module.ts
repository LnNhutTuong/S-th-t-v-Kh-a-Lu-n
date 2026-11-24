import { Module, forwardRef } from '@nestjs/common';
import { ThanhVienBoPhanService } from './thanh-vien-bo-phan.service.js';
import { BoPhanModule } from '../bo-phan/bo-phan.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [ThanhVienBoPhanService],
  exports: [ThanhVienBoPhanService],
  imports: [forwardRef(() => BoPhanModule), PrismaModule],
})
export class ThanhVienBoPhanModule {}
