import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBoPhanDto } from './create-bo-phan.dto.js';

export class UpdateBoPhanDto extends PartialType(OmitType(CreateBoPhanDto, ['ma', 'loai'])) {
    
}
