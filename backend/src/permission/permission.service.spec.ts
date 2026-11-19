import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { PermissionService } from './permission.service.js';

// Prisma gia: chi co dung 2 ham service dang goi
const prisma = {
  nguoiDungVaiTro: { findFirst: vi.fn() },
  thanhVienBoPhan: { findFirst: vi.fn() },
};

let service: PermissionService;

beforeEach(() => {
  vi.resetAllMocks(); // xoa sach loi dan cua ca truoc
  service = new PermissionService(prisma as any);
});

// Ham phu: dan "DB" tra loi gi.
// laAdmin = true  -> DB tim thay dong ADMIN
// coDongThanhVien = true -> DB tim thay dong thanh vien trong bo phan
function gia(laAdmin: boolean, coDongThanhVien: boolean) {
  prisma.nguoiDungVaiTro.findFirst.mockResolvedValue(laAdmin ? { id: 'a' } : null);
  prisma.thanhVienBoPhan.findFirst.mockResolvedValue(coDongThanhVien ? { id: 'x' } : null);
}

describe('hasPermission', () => {
  it('ADMIN thi co quyen va khong tra bang thanh vien', async () => {
    gia(true, false);
    const kq = await service.hasPermission('u1', 'van_ban.tai_len', 'bp1');
    expect(kq).toBe(true);
    expect(prisma.thanhVienBoPhan.findFirst).not.toHaveBeenCalled();
  });

  it('khong phai ADMIN, co dong thanh vien thi co quyen', async () => {
    gia(false, true);
    const kq = await service.hasPermission('u1', 'van_ban.tai_len', 'bp1');
    expect(kq).toBe(true);
  });

  it('khong phai ADMIN, khong co dong thanh vien thi khong co quyen', async () => {
    gia(false, false);
    const kq = await service.hasPermission('u1', 'van_ban.tai_len', 'bp1');
    expect(kq).toBe(false);
  });

  it('chua co vai tro ADMIN trong DB van tra false, khong nem loi', async () => {
    gia(false, false);
    await expect(service.hasPermission('u1', 'van_ban.tai_len', 'bp1')).resolves.toBe(false);
  });

  it('gui dung dieu kien loc: nguoi dung, bo phan, ma quyen, bo phan con hoat dong', async () => {
    gia(false, true);
    await service.hasPermission('u1', 'van_ban.tai_len', 'bp1');
    expect(prisma.thanhVienBoPhan.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nguoiDungId: 'u1',
          boPhanId: 'bp1',
          boPhan: { ngungHoatDong: false },
        }),
      }),
    );
  });
});

describe('checkPermission', () => {
  it('nem ForbiddenException khi khong co quyen', async () => {
    gia(false, false);
    await expect(service.checkPermission('u1', 'van_ban.tai_len', 'bp1')).rejects.toThrow(ForbiddenException);
  });

  it('khong nem loi khi nguoi thuong co quyen', async () => {
    gia(false, true);
    await expect(service.checkPermission('u1', 'van_ban.tai_len', 'bp1')).resolves.toBeUndefined();
  });

  it('khong nem loi khi la ADMIN', async () => {
    gia(true, false);
    await expect(service.checkPermission('u1', 'van_ban.tai_len', 'bp1')).resolves.toBeUndefined();
  });
});