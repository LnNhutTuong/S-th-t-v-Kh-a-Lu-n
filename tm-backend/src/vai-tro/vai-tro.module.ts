import { Module } from '@nestjs/common';
import { VaiTroService } from './vai-tro.service.js';
import { VaiTroController } from './vai-tro.controller.js';
import { PermissionModule } from '../permission/permission.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [VaiTroController],
  providers: [VaiTroService],
  imports :[PermissionModule, PrismaModule]
})
export class VaiTroModule {}
