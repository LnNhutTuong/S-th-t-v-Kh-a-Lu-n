import { Type } from "class-transformer";
import { IsString, IsOptional, IsNotEmpty, IsDate, } from "class-validator";

export class ThemThanhVienBoPhanDto {
    @IsString()
    @IsNotEmpty()
    nguoiDungId: string
    
    @IsString()
    @IsNotEmpty()
    vaiTroId: string

    @IsOptional() 
    @Type(() => Date) 
    @IsDate() 
    ngayThamGia?: Date
}
