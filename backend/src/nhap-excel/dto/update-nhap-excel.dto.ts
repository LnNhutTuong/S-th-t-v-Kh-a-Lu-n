import { PartialType } from '@nestjs/mapped-types';
import { CreateNhapExcelDto } from './create-nhap-excel.dto.js';

export class UpdateNhapExcelDto extends PartialType(CreateNhapExcelDto) {}

