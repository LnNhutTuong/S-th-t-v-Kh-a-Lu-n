import { describe, it, expect } from 'vitest';
import { BoPhanImporter } from './bo-phan.importer.js';
import { sinhMaBoPhan } from './utils/sinh-ma-bo-phan.js';

const dsDb = [
  { ma: 'BGH', ten: 'Ban giám hiệu', loai: 'BAN_GIAM_HIEU', ngungHoatDong: false, boPhanCha: null },
];
const prisma: any = { boPhan: { findMany: async () => dsDb } };
const importer = new BoPhanImporter(prisma, { DangKy() {} } as any);

const dong = (n: number, g: Record<string, unknown>) => ({ dong: n, giaTri: g });
const hang = (ten: string | null, loai: string, cha: string | null, ma: string | null = null) => ({
  Tên: ten,
  Loại: loai,
  'Bộ phận cha': cha,
  Nhóm: null,
  Mã: ma,
});

describe('sinhMaBoPhan', () => {
  it('sinh mã từ tên và loại, giống frontend', () => {
    expect(sinhMaBoPhan('Khoa Công nghệ thông tin', 'KHOA', new Set())).toBe('KHOA_CNTT');
    expect(sinhMaBoPhan('Phòng Đào tạo', 'PHONG', new Set())).toBe('PHONG_DT');
  });

  it('trùng mã thì thêm hậu tố _2', () => {
    expect(sinhMaBoPhan('Khoa Công nghệ thông tin', 'KHOA', new Set(['KHOA_CNTT']))).toBe('KHOA_CNTT_2');
  });

  it('tên chỉ có chữ chỉ loại thì không sinh được', () => {
    expect(sinhMaBoPhan('Khoa', 'KHOA', new Set())).toBe('');
  });
});

describe('BoPhanImporter', () => {
  it('báo lỗi tên trống và loại sai', () => {
    const loi = importer.kiemTra(dong(2, hang(null, 'SAI', 'Ban giám hiệu')));
    expect(loi.map((l) => l.cot)).toEqual(['Tên', 'Loại']);
  });

  it('cha nằm trong DB, tìm theo tên thì hợp lệ', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('Khoa Công nghệ thông tin', 'KHOA', 'Ban giám hiệu'))]);
    expect(loi).toEqual([]);
  });

  it('cha nằm trong cùng file, tìm theo tên thì hợp lệ', async () => {
    const loi = await importer.kiemTraCaFile([
      dong(2, hang('Khoa Công nghệ thông tin', 'KHOA', 'Ban giám hiệu')),
      dong(3, hang('Bộ môn Mạng máy tính', 'BO_MON', 'Khoa Công nghệ thông tin')),
    ]);
    expect(loi).toEqual([]);
  });

  it('báo lỗi khi không tìm thấy cha', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('Khoa A', 'KHOA', 'KHONGCO'))]);
    expect(loi).toEqual([{ dong: 2, cot: 'Bộ phận cha', thongBao: 'Không tìm thấy bộ phận "KHONGCO"' }]);
  });

  it('báo lỗi khi cha sai loại (Phòng dưới Khoa)', async () => {
    const loi = await importer.kiemTraCaFile([
      dong(2, hang('Khoa A', 'KHOA', 'Ban giám hiệu')),
      dong(3, hang('Phòng X', 'PHONG', 'Khoa A')),
    ]);
    expect(loi).toEqual([
      { dong: 3, cot: 'Bộ phận cha', thongBao: 'PHONG không thể nằm dưới KHOA' },
    ]);
  });

  it('báo lỗi khi hai bộ phận làm cha của nhau', async () => {
    const loi = await importer.kiemTraCaFile([
      dong(2, hang('Bộ môn A', 'BO_MON', 'Bộ môn B')),
      dong(3, hang('Bộ môn B', 'BO_MON', 'Bộ môn A')),
    ]);
    expect(loi.some((l) => l.thongBao.includes('vòng lặp'))).toBe(true);
  });

  it('layKhoa: có Mã thì theo Mã, không thì theo (Loại, Tên) bỏ dấu', () => {
    expect(importer.layKhoa(dong(2, hang('Khoa A', 'KHOA', 'x', 'ka')))).toBe('ma:ka');
    expect(importer.layKhoa(dong(2, hang('Phòng Đào tạo', 'PHONG', 'x')))).toBe('ten:phong|phong dao tao');
  });
});
