import { IsEnum, IsOptional } from "class-validator";
import { PhamViVaiTro, LoaiBoPhan } from "../../generated/prisma/enums.js";

export class QueryVaiTroDto{
    
    @IsOptional() 
    @IsEnum(PhamViVaiTro)
    phamVi?: PhamViVaiTro;

    @IsOptional() 
    @IsEnum(LoaiBoPhan) 
    loaiBoPhan?: LoaiBoPhan;
}