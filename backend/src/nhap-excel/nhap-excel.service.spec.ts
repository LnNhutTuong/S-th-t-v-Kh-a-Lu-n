import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NhapExcelService } from './nhap-excel.service.js';
import { ExcelService } from '../excel/excel.service.js';

const prisma: any = {
  phienNhapExcel: {
    create: vi.fn(async ({ data }) => ({ id: 'p1', ...data })),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(async (cb) => cb(prisma)),
};

const importerGia = {
  loai: 'BO_PHAN' as any,
  cot: [{ tieuDe: 'Mã', khoa: 'ma' }],
  kiemTra: (d: any) =>
    d.giaTri['Mã'] ? [] : [{ dong: d.dong, cot: 'Mã', thongBao: 'Mã không được để trống' }],
  ghi: vi.fn(),
};

describe('NhapExcelService', () => {
  const excel = new ExcelService();
  let service: NhapExcelService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NhapExcelService(prisma, excel);
    service.DangKy(importerGia);
  });

  const taoFile = (dong: any[]) =>
    excel.CreateFile([
      {
        ten: 'DuLieu',
        cot: [
          { tieuDe: 'Mã', khoa: 'ma' },
          { tieuDe: 'Tên', khoa: 'ten' },
        ],
        dong,
      },
    ]);

  describe('XemTruoc', () => {
    it('file đúng', async () => {
      const buffer = await taoFile([
        { ma: 'A', ten: 'x' },
        { ma: 'B', ten: 'y' },
      ]);
      const res = await service.XemTruoc('BO_PHAN' as any, 'u1', 'a.xlsx', buffer);
      expect(res.trangThai).toBe('XEM_TRUOC');
      expect(res.tomTat?.soLoi).toBe(0);
    });

    it('file có 1 dòng lỗi', async () => {
      const buffer = await taoFile([
        { ma: 'A', ten: 'x' },
        { ma: null, ten: 'y' },
      ]);
      const res = await service.XemTruoc('BO_PHAN' as any, 'u1', 'a.xlsx', buffer);
      expect(res.trangThai).toBe('LOI');
      expect(res.loi).toEqual([
        { dong: 3, cot: 'Mã', thongBao: 'Mã không được để trống' },
      ]);
    });

    it('hai dòng trùng khóa trong file thì báo lỗi', async () => {
      service.DangKy({ ...importerGia, cotKhoa: 'Mã', timKhoaDaCo: async () => new Set() });
      const buffer = await taoFile([
        { ma: 'A', ten: 'x' },
        { ma: 'a', ten: 'y' },
      ]);
      const res = await service.XemTruoc('BO_PHAN' as any, 'u1', 'a.xlsx', buffer);
        expect(res.trangThai).toBe('LOI');
        expect(res.loi).toEqual([{ dong: 3, cot: 'Mã', thongBao: 'Trùng với dòng 2' }]);
    });

    it('đếm đúng số tạo mới và cập nhật', async () => {
      service.DangKy({ ...importerGia, cotKhoa: 'Mã', timKhoaDaCo: async () => new Set(['a']) });
      const buffer = await taoFile([
        { ma: 'A', ten: 'x' },
        { ma: 'B', ten: 'y' },
      ]);
      const res = await service.XemTruoc('BO_PHAN' as any, 'u1', 'a.xlsx', buffer);
      expect(res.tomTat).toEqual({ tongDong: 2, soLoi: 0, soTaoMoi: 1, soCapNhat: 1 });
    });
  });

  describe('Duyet', () => {
    const phien = {
      id: 'p1',
      nguoiTaoId: 'u1',
      trangThai: 'XEM_TRUOC',
      loai: 'BO_PHAN',
      hetHanLuc: new Date(Date.now() + 60000),
      duLieuXemTruoc: [{ dong: 2, giaTri: { Mã: 'A', Tên: 'x' } }],
    };

    it('phiên có lỗi thì không nhập gì', async () => {
      prisma.phienNhapExcel.findUnique.mockResolvedValue({ ...phien, trangThai: 'LOI' });
      await expect(service.Duyet('p1', 'u1')).rejects.toThrow();
      expect(importerGia.ghi).not.toHaveBeenCalled();
    });

    it('phiên ổn thì ghi đúng một lần', async () => {
      prisma.phienNhapExcel.findUnique.mockResolvedValue(phien);
      prisma.phienNhapExcel.updateMany.mockResolvedValue({ count: 1 });

      await service.Duyet('p1', 'u1');

      expect(importerGia.ghi).toHaveBeenCalledTimes(1);
      expect(importerGia.ghi).toHaveBeenCalledWith(phien.duLieuXemTruoc, prisma);
    });
  });
});
