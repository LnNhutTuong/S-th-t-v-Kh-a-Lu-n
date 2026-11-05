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

@Module({
  imports: [
    PrismaModule,
    // TaskModule,
    // ScheduleModule.forRoot(),
    // CleanupModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    BoPhanModule,
    ThanhVienBoPhanModule,    
    PermissionModule,
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
