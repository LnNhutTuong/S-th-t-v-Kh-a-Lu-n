import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage-provider.interface.js';

@Injectable()
export class StorageService {
    
    constructor(
        private readonly provider: StorageProvider
    ){}
  
    async upload(key: string, file: Buffer, mimeType: string){
        return await this.provider.upload(key, file, mimeType)
    }

    async xoa(key: string){
        return await this.provider.xoa(key)
    }

    async layLinkTai(key: string, thoiGian: number){
        return await this.provider.layLinkTai(key, thoiGian)
    }

}
