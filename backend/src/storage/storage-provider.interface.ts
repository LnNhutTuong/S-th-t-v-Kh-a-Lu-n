export abstract class StorageProvider {
    abstract upload(key: string, file: Buffer, mimeType: string): Promise<void>
    abstract layLinkTai(key: string, thoiGian: number): Promise<string>
    abstract xoa(key: string): Promise<void>
}