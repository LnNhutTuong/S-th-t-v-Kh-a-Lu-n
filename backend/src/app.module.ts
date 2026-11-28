import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { APP_GUARD } from '@nestjs/core';
import { PermissionModule } from './permission/permission.module.js';
import { BoPhanModule } from './bo-phan/bo-phan.module.js';
import { ThanhVienBoPhanModule } from './thanh-vien-bo-phan/thanh-vien-bo-phan.module.js';
import { QuyenBoPhanGuard } from './permission/guards/permission-bo-phan.guard.js';
import { QuyenHanModule } from './quyen-han/quyen-han.module.js';
import { VaiTroModule } from './vai-tro/vai-tro.module.js';
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module.js';
import { ExcelModule } from './excel/excel.module.js';
import { NhapExcelModule } from './nhap-excel/nhap-excel.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    PrismaModule,    
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    BoPhanModule,
    ThanhVienBoPhanModule,    
    PermissionModule, 
    QuyenHanModule, 
    VaiTroModule, 
    NguoiDungModule, 
    ExcelModule, 
    NhapExcelModule, 
    StorageModule,
  ],

  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: QuyenBoPhanGuard
    }

  ],
})
export class AppModule {}
