import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NhapExcelService } from '../nhap-excel/nhap-excel.service.js';
import type { ImporterExcel, LoiExcel } from '../nhap-excel/type/nhap-excel.type.js';
import type { CotExcel, DongExcel } from '../excel/type/excel.type.js';
import type { Prisma } from '../generated/prisma/client.js';
import { LoaiNhapExcel, PhamViVaiTro } from '../generated/prisma/enums.js';
import type { CapBac } from '../generated/prisma/enums.js';
import { boDau } from '../bo-phan/utils/sinh-ma-bo-phan.js';
import { getAllowedDomains } from '../utils/regex/email.regex.js';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BoPhanLite {
  id: string;
  ma: string;
  ten: string;
  loai: string;
  ngungHoatDong: boolean;
}

interface VaiTroLite {
  id: string;
  ma: string;
  ten: string;
  loaiBoPhan: string | null;
  capBac: CapBac | null;
  soLuongToiDa: number | null;
}

// Mỗi dòng = một người tại một bộ phận. Người kiêm nhiệm thì có nhiều dòng cùng Email.
@Injectable()
export class NguoiDungImporter implements ImporterExcel, OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private nhapExcel: NhapExcelService,
  ) {}

  loai = LoaiNhapExcel.NGUOI_DUNG;
  cotKhoa = 'Email'; // cột báo lỗi khi trùng khóa

  cot: CotExcel[] = [
    { tieuDe: 'Email', 
      khoa: 'email', 
      doRong: 30, 
      ghiChu: 'Email đăng nhập. Là khóa để nhập lại, cùng email thì cập nhật. Bắt buộc email AGU cung cấp', 
      viDu: 'nva@agu.edu.vn' },

    { tieuDe: 'Tên', 
      khoa: 'ten', 
      doRong: 25, 
      ghiChu: 'Bắt buộc với người mới', 
      viDu: 'Nguyễn Văn A' },
      
    { tieuDe: 'Ngày sinh', 
      khoa: 'ngaySinh', 
      ghiChu: 'Không bắt buộc. Dạng dd/mm/yyyy', 
      viDu: '15/08/1990' },

    {
      tieuDe: 'Bộ phận',
      khoa: 'boPhan',
      doRong: 30,
      ghiChu: 'Tên hoặc Mã bộ phận. Để trống nếu chỉ tạo tài khoản, chưa gán bộ phận. Ví dụ: Khoa + Công Nghệ Thông Tin',
      viDu: 'Khoa Công nghệ thông tin',
    },

    { tieuDe: 'Vai trò',
      khoa: 'vaiTro', 
      ghiChu: 'Chức vụ tại bộ phận, ví dụ Trưởng khoa, Giảng viên. Bắt buộc nếu có Bộ phận', 
      viDu: 'Giảng viên' },

    { tieuDe: 'Ngày tham gia', 
      khoa: 'ngayThamGia', 
      ghiChu: 'Không bắt buộc, để trống là hôm nay. Dạng dd/mm/yyyy' },
  ];

  onModuleInit() {
    this.nhapExcel.DangKy(this);
  }

  private chuoi(v: unknown): string {
    return v === null || v === undefined ? '' : String(v).trim();
  }

  // null: để trống, 'LOI': sai định dạng. Chấp nhận Date, chuỗi ISO (sau khi lưu Json) và dd/mm/yyyy
  private docNgay(v: unknown): Date | null | 'LOI' {
    if (v === null || v === undefined || v === '') return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? 'LOI' : v;

    const s = String(v).trim();
    const m = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(s);
    if (m) {
      const d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
      return d.getUTCMonth() === Number(m[2]) - 1 ? d : 'LOI'; // 31/02 sẽ nhảy sang tháng 3
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? 'LOI' : d;
  }

  private timBoPhan(ds: BoPhanLite[], chu: string): BoPhanLite | 'KHONG' | 'NHIEU' {
    const theoMa = ds.filter((b) => b.ma.toUpperCase() === chu.toUpperCase());
    if (theoMa.length === 1) return theoMa[0];
    const theoTen = ds.filter((b) => boDau(b.ten) === boDau(chu));
    if (theoTen.length === 1) return theoTen[0];
    return theoTen.length === 0 ? 'KHONG' : 'NHIEU';
  }

  private timVaiTro(ds: VaiTroLite[], loaiBoPhan: string, chu: string): VaiTroLite | undefined {
    return ds.find(
      (v) => v.loaiBoPhan === loaiBoPhan && (v.ma.toUpperCase() === chu.toUpperCase() || boDau(v.ten) === boDau(chu)),
    );
  }

  layKhoa(d: DongExcel): string | null {
    const email = this.chuoi(d.giaTri['Email']).toLowerCase();
    if (!email) return null;
    return `${email}|${boDau(this.chuoi(d.giaTri['Bộ phận']))}`;
  }

  kiemTra(d: DongExcel): LoiExcel[] {
    const loi: LoiExcel[] = [];
    const them = (cot: string, thongBao: string) => loi.push({ dong: d.dong, cot, thongBao });
    const g = d.giaTri;

    const email = this.chuoi(g['Email']).toLowerCase();
    const boPhan = this.chuoi(g['Bộ phận']);
    const vaiTro = this.chuoi(g['Vai trò']);

    const domain = email?.split('@').pop();

    if (!email){
      them('Email', 'Email không được để trống');
    } 
    else if (!EMAIL_RE.test(email)) them('Email', 'Email không đúng định dạng');
    else if (!getAllowedDomains().includes(domain!)){
      them('Email', `Bắt buộc dùng email ${getAllowedDomains()}`);
    }

    if (boPhan && !vaiTro) them('Vai trò', 'Thiếu vai trò (bắt buộc khi có bộ phận)');
    if (vaiTro && !boPhan) them('Bộ phận', 'Thiếu bộ phận (có vai trò thì phải có bộ phận)');

    if (this.docNgay(g['Ngày sinh']) === 'LOI') them('Ngày sinh', 'Ngày không hợp lệ, dùng dd/mm/yyyy');
    if (this.docNgay(g['Ngày tham gia']) === 'LOI') them('Ngày tham gia', 'Ngày không hợp lệ, dùng dd/mm/yyyy');

    return loi;
  }

  async timKhoaDaCo(cacKhoa: string[]): Promise<Set<string>> {
    const ds = await this.prisma.nguoiDung.findMany({
      where: { deletedAt: null },
      select: { email: true, thanhVienBoPhan: { select: { boPhan: { select: { ma: true, ten: true } } } } },
    });

    const daCo = new Set<string>();
    for (const n of ds) {
      const e = n.email.toLowerCase();
      daCo.add(`${e}|`);
      for (const tv of n.thanhVienBoPhan) {
        daCo.add(`${e}|${boDau(tv.boPhan.ma)}`);
        daCo.add(`${e}|${boDau(tv.boPhan.ten)}`);
      }
    }
    return new Set(cacKhoa.filter((k) => daCo.has(k)));
  }

  async kiemTraCaFile(cacDong: DongExcel[]): Promise<LoiExcel[]> {
    const loi: LoiExcel[] = [];

    const dsBoPhan = await this.prisma.boPhan.findMany({
      select: { id: true, ma: true, ten: true, loai: true, ngungHoatDong: true },
    });
    const dsVaiTro = await this.prisma.vaiTro.findMany({
      where: { phamVi: PhamViVaiTro.BO_PHAN },
      select: { id: true, ma: true, ten: true, loaiBoPhan: true, capBac: true, soLuongToiDa: true },
    });
    const dsNguoi = await this.prisma.nguoiDung.findMany({
      select: {
        email: true,
        deletedAt: true,
        thanhVienBoPhan: { where: { ngayKetThuc: null }, select: { boPhanId: true, vaiTroId: true } },
      },
    });

    const nguoiTheoEmail = new Map(dsNguoi.map((n) => [n.email.toLowerCase(), n]));

    // Ai đang giữ vai trò nào ở bộ phận nào sau khi nhập: lấy từ DB, rồi file ghi đè lên
    const giuVaiTro = new Map<string, string>(); // `${boPhanId}|${email}` -> vaiTroId
    for (const n of dsNguoi) {
      if (n.deletedAt) continue;
      for (const tv of n.thanhVienBoPhan) giuVaiTro.set(`${tv.boPhanId}|${n.email.toLowerCase()}`, tv.vaiTroId);
    }

    const tenTheoEmail = new Map<string, string>();
    const dongDauCuaEmail = new Map<string, number>();
    const cacGan: { dong: number; boPhan: BoPhanLite; vaiTro: VaiTroLite }[] = [];

    for (const d of cacDong) {
      const g = d.giaTri;
      const email = this.chuoi(g['Email']).toLowerCase();
      if (!email) continue;

      if (!dongDauCuaEmail.has(email)) dongDauCuaEmail.set(email, d.dong);

      if (nguoiTheoEmail.get(email)?.deletedAt) {
        loi.push({ dong: d.dong, cot: 'Email', thongBao: 'Người dùng này đã bị xóa' });
        continue;
      }

      const ten = this.chuoi(g['Tên']);
      if (ten) {
        const tenCu = tenTheoEmail.get(email);
        if (tenCu !== undefined && boDau(tenCu) !== boDau(ten)) {
          loi.push({ dong: d.dong, cot: 'Tên', thongBao: 'Khác với tên ở dòng trước của cùng email' });
        } else {
          tenTheoEmail.set(email, ten);
        }
      }

      const chuBp = this.chuoi(g['Bộ phận']);
      const chuVt = this.chuoi(g['Vai trò']);
      if (!chuBp || !chuVt) continue; // thiếu một trong hai đã được kiemTra từng dòng báo

      const bp = this.timBoPhan(dsBoPhan, chuBp);
      if (bp === 'KHONG') {
        loi.push({ dong: d.dong, cot: 'Bộ phận', thongBao: `Không tìm thấy bộ phận "${chuBp}"` });
        continue;
      }
      if (bp === 'NHIEU') {
        loi.push({ dong: d.dong, cot: 'Bộ phận', thongBao: `Có nhiều bộ phận trùng tên "${chuBp}", hãy nhập mã` });
        continue;
      }
      if (bp.ngungHoatDong) {
        loi.push({ dong: d.dong, cot: 'Bộ phận', thongBao: 'Bộ phận này đã ngưng hoạt động' });
        continue;
      }

      const vt = this.timVaiTro(dsVaiTro, bp.loai, chuVt);
      if (!vt) {
        const hopLe = dsVaiTro.filter((v) => v.loaiBoPhan === bp.loai).map((v) => v.ten).join(', ');
        loi.push({
          dong: d.dong,
          cot: 'Vai trò',
          thongBao: `Vai trò "${chuVt}" không thuộc loại ${bp.loai}. Hợp lệ: ${hopLe}`,
        });
        continue;
      }

      giuVaiTro.set(`${bp.id}|${email}`, vt.id);
      cacGan.push({ dong: d.dong, boPhan: bp, vaiTro: vt });
    }

    // người mới phải có tên (ở ít nhất một dòng của email đó)
    for (const [email, dong] of dongDauCuaEmail) {
      if (!nguoiTheoEmail.has(email) && !tenTheoEmail.has(email)) {
        loi.push({ dong, cot: 'Tên', thongBao: 'Người mới phải có Tên' });
      }
    }

    // số người tối đa của mỗi vai trò trong mỗi bộ phận
    const dem = new Map<string, number>();
    for (const [khoa, vaiTroId] of giuVaiTro) {
      const k = `${khoa.split('|')[0]}|${vaiTroId}`;
      dem.set(k, (dem.get(k) ?? 0) + 1);
    }
    for (const gan of cacGan) {
      const max = gan.vaiTro.soLuongToiDa;
      const soNguoi = dem.get(`${gan.boPhan.id}|${gan.vaiTro.id}`) ?? 0;
      if (max !== null && soNguoi > max) {
        loi.push({
          dong: gan.dong,
          cot: 'Vai trò',
          thongBao: `Vượt quá ${max} người giữ vai trò ${gan.vaiTro.ten} tại ${gan.boPhan.ten}`,
        });
      }
    }

    return loi;
  }

  async ghi(cacDong: DongExcel[], tx: Prisma.TransactionClient): Promise<void> {
    const dsBoPhan = await tx.boPhan.findMany({
      select: { id: true, ma: true, ten: true, loai: true, ngungHoatDong: true },
    });

    const dsVaiTro = await tx.vaiTro.findMany({
      where: { 
        phamVi: PhamViVaiTro.BO_PHAN 
      },
      select: { id: true, ma: true, ten: true, loaiBoPhan: true, capBac: true, soLuongToiDa: true },
    });

    const idTheoEmail = new Map<string, string>();

    // Lượt 1: tạo hoặc cập nhật người dùng
    for (const d of cacDong) {
      const g = d.giaTri;
      const email = this.chuoi(g['Email']).toLowerCase();
      const ten = this.chuoi(g['Tên']);
      const ngaySinh = this.docNgay(g['Ngày sinh']);
      const ngaySinhHopLe = ngaySinh === 'LOI' ? null : ngaySinh;

      const du: { ten?: string; ngaySinh?: Date } = {};
      if (ten) du.ten = ten;
      if (ngaySinhHopLe) du.ngaySinh = ngaySinhHopLe;

      const nguoi = await tx.nguoiDung.upsert({
        where: { email },
        update: du,
        create: { email, ten: ten || email, ...(ngaySinhHopLe ? { ngaySinh: ngaySinhHopLe } : {}) },
      });
      idTheoEmail.set(email, nguoi.id);
    }

    // Lượt 2: gán bộ phận và vai trò
    const cacGan: { email: string; boPhan: BoPhanLite; vaiTro: VaiTroLite; ngay: Date | null }[] = [];
    for (const d of cacDong) {
      const g = d.giaTri;
      const chuBp = this.chuoi(g['Bộ phận']);
      const chuVt = this.chuoi(g['Vai trò']);
      if (!chuBp || !chuVt) continue;

      const bp = this.timBoPhan(dsBoPhan, chuBp);
      if (typeof bp === 'string') {
        throw new BadRequestException(`Dòng ${d.dong}: không xác định được bộ phận "${chuBp}"`);
      }
      const vt = this.timVaiTro(dsVaiTro, bp.loai, chuVt);
      if (!vt || !vt.capBac) {
        throw new BadRequestException(`Dòng ${d.dong}: vai trò "${chuVt}" không hợp lệ`);
      }

      const ngay = this.docNgay(g['Ngày tham gia']);
      cacGan.push({
        email: this.chuoi(g['Email']).toLowerCase(),
        boPhan: bp,
        vaiTro: vt,
        ngay: ngay === 'LOI' ? null : ngay,
      });
    }

    // Gán Trưởng sau cùng: nếu file đổi Trưởng thì người cũ phải được hạ vai trò trước,
    // không thì chỉ mục "mỗi bộ phận một Trưởng" trong DB sẽ chặn
    cacGan.sort((a, b) => Number(a.vaiTro.capBac === 'TRUONG') - Number(b.vaiTro.capBac === 'TRUONG'));

    for (const gan of cacGan) {
      const nguoiDungId = idTheoEmail.get(gan.email);
      if (!nguoiDungId) continue;
      const khoa = { nguoiDungId_boPhanId: { nguoiDungId, boPhanId: gan.boPhan.id } };
      const chung = { vaiTroId: gan.vaiTro.id, capBac: gan.vaiTro.capBac as CapBac, ngayKetThuc: null };

      try {
        const cu = await tx.thanhVienBoPhan.findUnique({ where: khoa });
        if (cu) {
          await tx.thanhVienBoPhan.update({
            where: khoa,
            data: { ...chung, ...(gan.ngay ? { ngayThamGia: gan.ngay } : {}) },
          });
        } else {
          await tx.thanhVienBoPhan.create({
            data: { ...chung, nguoiDungId, boPhanId: gan.boPhan.id, ngayThamGia: gan.ngay ?? new Date() },
          });
        }
      } catch (e: any) {
        if (e.code === 'P2002') throw new BadRequestException(`Bộ phận "${gan.boPhan.ten}" đã có trưởng`);
        throw e;
      }
    }
  }
}
