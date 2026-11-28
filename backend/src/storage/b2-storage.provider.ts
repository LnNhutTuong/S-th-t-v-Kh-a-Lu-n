import { ConfigService } from "@nestjs/config";
import { StorageProvider } from "./storage-provider.interface.js";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from "@nestjs/common";

@Injectable()
export class B2StorageProvider extends StorageProvider{

    private client: S3Client;
    private bucketName: string;

    constructor(
        private readonly config: ConfigService
    ){
        super();

        this.bucketName = this.config.getOrThrow<string>('STORAGE_BUCKET')
        this.client = new S3Client({
            endpoint: this.config.getOrThrow<string>('STORAGE_ENDPOINT'),
            region: this.config.getOrThrow<string>('STORAGE_REGION'),
            forcePathStyle: true,
            credentials:{
                accessKeyId: this.config.getOrThrow<string>('STORAGE_KEY_ID'),
                secretAccessKey: this.config.getOrThrow<string>('STORAGE_APP_KEY'),
            }
        })
    }

    async upload(key: string, file: Buffer, mimeType: string): Promise<void>{
        await this.client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ContentType: mimeType,
        }))
    }

    async xoa(key: string): Promise<void>{
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        }))
    }

    async layLinkTai(key: string, thoiGian: number): Promise<string> {
        return getSignedUrl(
            this.client,
            new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }),
            {   
                expiresIn: thoiGian
            }
        )
    }



    
}