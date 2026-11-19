import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Thu di de lai la vang, em di de lai muon van nho thuong';
  }

  async getReady(): Promise<{ status: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'Ready to work' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable')
    }
  }
}
