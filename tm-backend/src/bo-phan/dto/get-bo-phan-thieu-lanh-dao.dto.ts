import { IsEnum, IsOptional } from "class-validator";
import { LoaiBoPhan } from "../../generated/prisma/enums.js";

export class getBoPhanThieuLanhDaoDto{
    @IsEnum(LoaiBoPhan)
    @IsOptional()
    loai: LoaiBoPhan
}