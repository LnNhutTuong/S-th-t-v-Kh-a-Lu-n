import { describe, it, expect } from 'vitest';
import { ExcelService } from './excel.service.js';

describe('ExcelService', () => {
  const service = new ExcelService();

  const taoBuffer = () =>
    service.CreateFile([
      {
        ten: 'BoPhan',
        cot: [
          { tieuDe: 'Mã', khoa: 'ma' },
          { tieuDe: 'Tên', khoa: 'ten', doRong: 30 },
        ],
        dong: [
          { ma: 'KHOA-CNTT', ten: '  Khoa CNTT ' },
          { ma: null, ten: null },
          { ma: 'PH-DT', ten: 'Phòng Đào tạo' },
        ],
      },
    ]);

  it('ghi ra rồi đọc lại đúng, cắt khoảng trắng, bỏ dòng trống, giữ số dòng', async () => {
    const ketQua = await service.ReadFile(await taoBuffer());

    expect(ketQua).toEqual([
      { dong: 2, giaTri: { Mã: 'KHOA-CNTT', Tên: 'Khoa CNTT' } },
      { dong: 4, giaTri: { Mã: 'PH-DT', Tên: 'Phòng Đào tạo' } },
    ]);
  });

  it('báo lỗi khi không có sheet tên đó', async () => {
    await expect(service.ReadFile(await taoBuffer(), 'KhongCo')).rejects.toThrow();
  });

  it('sinh template đọc lại được, sheet đầu rỗng, có đủ 2 sheet', async () => {
  const buf = await service.CreateTemplate([
    { tieuDe: 'Loại', khoa: 'loai', ghiChu: 'Chọn loại bộ phận', danhSach: ['KHOA', 'PHONG'], viDu: 'KHOA' },
    { tieuDe: 'Tên', khoa: 'ten', viDu: 'Khoa CNTT' },
  ]);

  expect(await service.ReadFile(buf)).toEqual([]);
  expect(await service.ReadFile(buf, 'ViDu')).toEqual([
    { dong: 2, giaTri: { Loại: 'KHOA', Tên: 'Khoa CNTT' } },
  ]);
});
});