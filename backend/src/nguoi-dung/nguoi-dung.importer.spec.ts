import { describe, it, expect } from 'vitest';
import { NguoiDungImporter } from './nguoi-dung.importer.js';

const dsBoPhan = [
  { id: 'b1', ma: 'KHOA_CNTT', ten: 'Khoa Công nghệ thông tin', loai: 'KHOA', ngungHoatDong: false },
];
const dsVaiTro = [
  { id: 'v1', ma: 'TRUONG_KHOA', ten: 'Trưởng khoa', loaiBoPhan: 'KHOA', capBac: 'TRUONG', soLuongToiDa: 1 },
  { id: 'v2', ma: 'GIANG_VIEN', ten: 'Giảng viên', loaiBoPhan: 'KHOA', capBac: 'THANH_VIEN', soLuongToiDa: null },
  { id: 'v3', ma: 'TRUONG_PHONG', ten: 'Trưởng phòng', loaiBoPhan: 'PHONG', capBac: 'TRUONG', soLuongToiDa: 1 },
];
// cu@agu.edu.vn đang là Trưởng khoa CNTT
const dsNguoi = [
  { email: 'cu@agu.edu.vn', deletedAt: null, thanhVienBoPhan: [{ boPhanId: 'b1', vaiTroId: 'v1' }] },
];

const prisma: any = {
  boPhan: { findMany: async () => dsBoPhan },
  vaiTro: { findMany: async () => dsVaiTro },
  nguoiDung: { findMany: async () => dsNguoi },
};
const importer = new NguoiDungImporter(prisma, { DangKy() {} } as any);

const BP = 'Khoa Công nghệ thông tin';
const dong = (n: number, g: Record<string, unknown>) => ({ dong: n, giaTri: g });
const hang = (
  email: string | null,
  ten: string | null,
  boPhan: string | null,
  vaiTro: string | null,
  ngaySinh: string | null = null,
) => ({ Email: email, Tên: ten, 'Ngày sinh': ngaySinh, 'Bộ phận': boPhan, 'Vai trò': vaiTro, 'Ngày tham gia': null });

describe('NguoiDungImporter.kiemTra (từng dòng)', () => {
  it('email sai định dạng và có bộ phận nhưng thiếu vai trò', () => {
    const loi = importer.kiemTra(dong(2, hang('sai', 'A', BP, null)));
    expect(loi.map((l) => l.cot)).toEqual(['Email', 'Vai trò']);
  });

  it('ngày sinh không tồn tại (31/02) thì báo lỗi, ngày đúng thì không', () => {
    expect(importer.kiemTra(dong(2, hang('a@agu.edu.vn', 'A', null, null, '31/02/2000'))).map((l) => l.cot)).toEqual(['Ngày sinh']);
    expect(importer.kiemTra(dong(2, hang('a@agu.edu.vn', 'A', null, null, '15/08/1990')))).toEqual([]);
  });

  it('chỉ có email, chưa gán bộ phận thì hợp lệ', () => {
    expect(importer.kiemTra(dong(2, hang('a@agu.edu.vn', 'A', null, null)))).toEqual([]);
  });
});

describe('NguoiDungImporter.kiemTraCaFile (so với DB và giữa các dòng)', () => {
  it('người mới không có tên thì báo lỗi', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('moi@agu.edu.vn', null, null, null))]);
    expect(loi).toEqual([{ dong: 2, cot: 'Tên', thongBao: 'Người mới phải có Tên' }]);
  });

  it('vai trò không thuộc loại bộ phận thì báo lỗi và liệt kê vai trò hợp lệ', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('moi@agu.edu.vn', 'Mới', BP, 'Trưởng phòng'))]);
    expect(loi).toEqual([
      {
        dong: 2,
        cot: 'Vai trò',
        thongBao: 'Vai trò "Trưởng phòng" không thuộc loại KHOA. Hợp lệ: Trưởng khoa, Giảng viên',
      },
    ]);
  });

  it('thêm Trưởng khoa thứ hai khi đã có một thì báo vượt số người', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('moi@agu.edu.vn', 'Mới', BP, 'Trưởng khoa'))]);
    expect(loi).toEqual([
      {
        dong: 2,
        cot: 'Vai trò',
        thongBao: 'Vượt quá 1 người giữ vai trò Trưởng khoa tại Khoa Công nghệ thông tin',
      },
    ]);
  });

  it('đổi Trưởng (người cũ xuống Giảng viên, người mới lên Trưởng) thì không lỗi', async () => {
    const loi = await importer.kiemTraCaFile([
      dong(2, hang('cu@agu.edu.vn', null, BP, 'Giảng viên')),
      dong(3, hang('moi@agu.edu.vn', 'Mới', BP, 'Trưởng khoa')),
    ]);
    expect(loi).toEqual([]);
  });

  it('bộ phận không tồn tại thì báo lỗi', async () => {
    const loi = await importer.kiemTraCaFile([dong(2, hang('moi@agu.edu.vn', 'Mới', 'Khoa Ma', 'Giảng viên'))]);
    expect(loi).toEqual([{ dong: 2, cot: 'Bộ phận', thongBao: 'Không tìm thấy bộ phận "Khoa Ma"' }]);
  });
});

describe('NguoiDungImporter.layKhoa', () => {
  it('khóa là email (viết thường) cộng bộ phận (bỏ dấu), kiêm nhiệm thì khác khóa', () => {
    expect(importer.layKhoa(dong(2, hang('A@AGU.edu.vn', 'A', BP, 'Giảng viên')))).toBe(
      'a@agu.edu.vn|khoa cong nghe thong tin',
    );
    expect(importer.layKhoa(dong(2, hang('A@AGU.edu.vn', 'A', null, null)))).toBe('a@agu.edu.vn|');
  });
});