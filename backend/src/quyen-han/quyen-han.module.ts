import { Module } from '@nestjs/common';
import { QuyenHanService } from './quyen-han.service.js';
import { QuyenHanController } from './quyen-han.controller.js';
import { PermissionModule } from '../permission/permission.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [QuyenHanController],
  providers: [QuyenHanService],
  imports: [PermissionModule, PrismaModule]
})
export class QuyenHanModule {}
