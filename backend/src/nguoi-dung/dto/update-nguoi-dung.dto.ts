import { PartialType } from '@nestjs/mapped-types';
import { CreateNguoiDungDto } from './create-nguoi-dung.dto.js';

export class UpdateNguoiDungDto extends PartialType(CreateNguoiDungDto) {}
