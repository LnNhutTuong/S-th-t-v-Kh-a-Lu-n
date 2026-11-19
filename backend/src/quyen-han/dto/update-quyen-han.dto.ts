import { PartialType } from '@nestjs/mapped-types';
import { CreateQuyenHanDto } from './create-quyen-han.dto.js';

export class UpdateQuyenHanDto extends PartialType(CreateQuyenHanDto) {}
