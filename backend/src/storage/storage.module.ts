import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { StorageProvider } from './storage-provider.interface.js';
import { B2StorageProvider } from './b2-storage.provider.js';
import { StorageTestController } from './storage-test.controller.js';

@Module({
  providers: [StorageService, {provide: StorageProvider, useClass: B2StorageProvider}],
  exports: [StorageService],
  controllers: [StorageTestController]
})
export class StorageModule {}
