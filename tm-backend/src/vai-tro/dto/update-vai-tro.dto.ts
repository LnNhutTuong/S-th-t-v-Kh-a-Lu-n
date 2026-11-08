import { IsUUID } from 'class-validator';

export class UpdateVaiTroDto{

    @IsUUID()
    tuVaiTroId: string
}
