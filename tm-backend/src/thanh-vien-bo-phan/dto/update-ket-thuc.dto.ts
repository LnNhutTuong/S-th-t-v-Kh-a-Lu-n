import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class UpdateNgayKetThucDto {
    @IsOptional() 
    @Type(() => Date) 
    @IsDate() 
    ngayKetThuc?: Date
}