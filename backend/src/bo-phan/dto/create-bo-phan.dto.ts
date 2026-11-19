import {IsString, IsNotEmpty, IsObject, MaxLength, MinLength, Matches, IsEnum, IsOptional, ValidateIf, IsUUID } from 'class-validator';
import {
  LoaiBoPhan,
  NhomDonVi,
} from '../../generated/prisma/enums.js';
import { Transform } from 'class-transformer';

export class CreateBoPhanDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Mã chỉ được chứa chữ cái, chữ số, dấu gạch ngang và gạch dưới.',
    })
    @Transform(({ value }: { value: string }) => value.trim())
    ma: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    @MinLength(3)
    ten: string;

    @IsEnum(LoaiBoPhan)
    loai: LoaiBoPhan;

    @IsOptional()
    @IsString()
    boPhanChaId?: string;

    @IsEnum(NhomDonVi)
    @IsOptional()
    nhom?: NhomDonVi;

    @IsObject()
    @IsOptional()
    thongTinThem?: Record<string, any>;
}
