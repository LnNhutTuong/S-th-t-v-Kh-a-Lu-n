import { IsNotEmpty, IsString } from "class-validator";
export class XemTruocDto{
    @IsString() 
    @IsNotEmpty() 
    tenFile: string;

    @IsString()
    @IsNotEmpty()
    noiDung: string;
}