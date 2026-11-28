import { Controller, Get } from '@nestjs/common';
import { StorageService } from './storage.service.js';

@Controller('storage-test')
export class StorageTestController {
    constructor(
        private readonly storageService: StorageService
    ){}

    @Get('up')
    async up(){
        await this.storageService.upload('test/hello.txt', Buffer.from('xin chao'), 'text/plain')
        const url = await this.storageService.layLinkTai('test/hello.txt', 300);
        return url;
    }

    @Get('xoa')
    async xoa(){
        await this.storageService.xoa('test/hello.txt');
        return {xoa: 'thanh cong'};
    }
}
