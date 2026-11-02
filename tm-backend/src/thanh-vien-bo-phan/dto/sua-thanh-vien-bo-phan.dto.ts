import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ThemThanhVienBoPhanDto } from './them-thanh-vien-bo-phan.dto.js';

export class SuaThanhVienBoPhanDto extends PartialType(OmitType(ThemThanhVienBoPhanDto, ['nguoiDungId'])) {}
