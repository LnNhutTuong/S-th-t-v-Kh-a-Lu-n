import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NhapExcelService } from '../nhap-excel/nhap-excel.service.js';
import type { ImporterExcel, LoiExcel } from '../nhap-excel/type/nhap-excel.type.js';
import type { CotExcel, DongExcel } from '../excel/type/excel.type.js';
import type { Prisma } from '../generated/prisma/client.js';
import { LoaiBoPhan, LoaiNhapExcel, NhomDonVi } from '../generated/prisma/enums.js';
import { CHA_HOP_LE } from '../permission/constants/quyen-han.constants.js';
import { boDau, sinhMaBoPhan, tinhNhom } from './utils/sinh-ma-bo-phan.js';

const DS_LOAI = Object.values(LoaiBoPhan) as string[];
const DS_NHOM = Object.values(NhomDonVi) as string[];

// Một bộ phận trong "cây sẽ có sau khi nhập" (DB cộng với file) dùng để kiểm tra cha và vòng lặp
interface Nut {
  ma: string | null; // null: chưa có mã (sẽ tự sinh khi ghi)
  tenKey: string; // tên bỏ dấu, viết thường
  loai: string;
  ngung: boolean;
  chaMa: string | null; // cha hiện có trong DB (nút không nằm trong file)
  chaChu: string | null; // chữ ở cột "Bộ phận cha" (nút nằm trong file)
  laFile: boolean;
}

type KetQuaTimCha = Nut | 'KHONG' | 'NHIEU';

@Injectable()
export class BoPhanImporter implements ImporterExcel, OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private nhapExcel: NhapExcelService,
  ) {}

  loai = LoaiNhapExcel.BO_PHAN;
  cotKhoa = 'Tên'; // cột báo lỗi khi trùng khóa

  cot: CotExcel[] = [
    { tieuDe: 'Tên', khoa: 'ten', doRong: 35, viDu: 'Khoa Công nghệ thông tin' },
    { tieuDe: 'Loại', khoa: 'loai', danhSach: DS_LOAI, ghiChu: 'Chọn trong danh sách', viDu: 'KHOA' },
    {
      tieuDe: 'Bộ phận cha',
      khoa: 'cha',
      doRong: 30,
      ghiChu: 'Nhập Tên hoặc Mã của bộ phận cha. Để trống nếu là Ban giám hiệu',
      viDu: 'Ban giám hiệu',
    },
    { tieuDe: 'Nhóm', khoa: 'nhom', danhSach: DS_NHOM, ghiChu: 'Chỉ cần với Viện, Trung tâm, Trường. Loại khác tự suy ra' },
    { tieuDe: 'Mã', khoa: 'ma', ghiChu: 'Để trống thì tự sinh từ Tên và Loại. Điền nếu muốn tự đặt mã' },
  ];

  onModuleInit() {
    this.nhapExcel.DangKy(this);
  }

  private chuoi(v: unknown): string {
    return v === null || v === undefined ? '' : String(v).trim();
  }

  private khoaTen(loai: string, ten: string): string {
    return `ten:${loai.toLowerCase()}|${boDau(ten)}`;
  }

  // Khóa của một dòng: có Mã thì theo Mã, không thì theo (Loại, Tên)
  layKhoa(d: DongExcel): string | null {
    const ma = this.chuoi(d.giaTri['Mã']);
    if (ma) return `ma:${ma.toLowerCase()}`;
    const ten = this.chuoi(d.giaTri['Tên']);
    const loai = this.chuoi(d.giaTri['Loại']);
    return ten && loai ? this.khoaTen(loai, ten) : null;
  }

  kiemTra(d: DongExcel): LoiExcel[] {
    const loi: LoiExcel[] = [];
    const them = (cot: string, thongBao: string) => loi.push({ dong: d.dong, cot, thongBao });
    const g = d.giaTri;

    const ten = this.chuoi(g['Tên']);
    const loai = this.chuoi(g['Loại']);
    const nhom = this.chuoi(g['Nhóm']);
    const cha = this.chuoi(g['Bộ phận cha']);

    if (!ten) them('Tên', 'Tên không được để trống');
    if (!DS_LOAI.includes(loai)) them('Loại', 'Loại không hợp lệ');
    if (nhom && !DS_NHOM.includes(nhom)) them('Nhóm', 'Nhóm không hợp lệ');

    if (loai === 'BAN_GIAM_HIEU' && cha) them('Bộ phận cha', 'Ban giám hiệu không có bộ phận cha');
    if (DS_LOAI.includes(loai) && loai !== 'BAN_GIAM_HIEU' && !cha) them('Bộ phận cha', 'Thiếu bộ phận cha');

    // không điền Mã mà tên lại không sinh được mã (ví dụ tên chỉ có chữ "Khoa")
    if (ten && DS_LOAI.includes(loai) && !this.chuoi(g['Mã']) && !sinhMaBoPhan(ten, loai as LoaiBoPhan, new Set())) {
      them('Mã', 'Không sinh được mã từ tên này, hãy điền cột Mã');
    }

    return loi;
  }

  async timKhoaDaCo(cacKhoa: string[]): Promise<Set<string>> {
    const ds = await this.prisma.boPhan.findMany({ select: { ma: true, ten: true, loai: true } });
    const daCo = new Set<string>();
    for (const b of ds) {
      daCo.add(`ma:${b.ma.toLowerCase()}`);
      daCo.add(this.khoaTen(b.loai, b.ten));
    }
    return new Set(cacKhoa.filter((k) => daCo.has(k)));
  }

  async kiemTraCaFile(cacDong: DongExcel[]): Promise<LoiExcel[]> {
    const loi: LoiExcel[] = [];

    const dsDb = await this.prisma.boPhan.findMany({
      select: { ma: true, ten: true, loai: true, ngungHoatDong: true, boPhanCha: { select: { ma: true } } },
    });

    // 1. nút từ DB
    const cacNut: Nut[] = dsDb.map((b) => ({
      ma: b.ma,
      tenKey: boDau(b.ten),
      loai: b.loai,
      ngung: b.ngungHoatDong,
      chaMa: b.boPhanCha?.ma ?? null,
      chaChu: null,
      laFile: false,
    }));

    // 2. dòng của file: trùng nút có sẵn thì ghi đè lên nó, không thì thêm nút mới
    const nutCuaDong = new Map<number, Nut>();
    for (const d of cacDong) {
      const g = d.giaTri;
      const ten = this.chuoi(g['Tên']);
      const loai = this.chuoi(g['Loại']);
      const ma = this.chuoi(g['Mã']).toUpperCase();
      const tenKey = boDau(ten);

      let nut = cacNut.find(
        (n) => !n.laFile && (ma ? n.ma?.toUpperCase() === ma : n.loai === loai && n.tenKey === tenKey),
      );
      if (nut) {
        nut.tenKey = tenKey;
        nut.loai = loai;
      } else {
        nut = { ma: ma || null, tenKey, loai, ngung: false, chaMa: null, chaChu: null, laFile: true };
        cacNut.push(nut);
      }
      nut.laFile = true;
      nut.chaChu = this.chuoi(g['Bộ phận cha']) || null;
      nutCuaDong.set(d.dong, nut);
    }

    // 3. tìm cha theo Mã trước, không có thì theo Tên (phải duy nhất)
    const timCha = (chu: string): KetQuaTimCha => {
      const theoMa = cacNut.filter((n) => n.ma && n.ma.toUpperCase() === chu.toUpperCase());
      if (theoMa.length === 1) return theoMa[0];
      const theoTen = cacNut.filter((n) => n.tenKey === boDau(chu));
      if (theoTen.length === 1) return theoTen[0];
      return theoTen.length === 0 ? 'KHONG' : 'NHIEU';
    };

    const chaCua = (n: Nut): KetQuaTimCha | null => {
      if (n.laFile) return n.chaChu ? timCha(n.chaChu) : null;
      const chaMa = n.chaMa;
      if (!chaMa) return null;
      return cacNut.find((x) => x.ma?.toUpperCase() === chaMa.toUpperCase()) ?? null;
    };

    // 4. kiểm tra từng dòng
    const soBgh = cacNut.filter((n) => n.loai === 'BAN_GIAM_HIEU').length;

    for (const d of cacDong) {
      const nut = nutCuaDong.get(d.dong);
      if (!nut) continue;

      if (nut.loai === 'BAN_GIAM_HIEU' && soBgh > 1) {
        loi.push({ dong: d.dong, cot: 'Loại', thongBao: 'Hệ thống chỉ có một Ban giám hiệu' });
      }

      if (!nut.chaChu) continue; // thiếu cha đã được kiemTra từng dòng báo rồi

      const them = (thongBao: string) => loi.push({ dong: d.dong, cot: 'Bộ phận cha', thongBao });
      const cha = timCha(nut.chaChu);

      if (cha === 'KHONG') {
        them(`Không tìm thấy bộ phận "${nut.chaChu}"`);
        continue;
      }
      if (cha === 'NHIEU') {
        them(`Có nhiều bộ phận trùng tên "${nut.chaChu}", hãy nhập mã`);
        continue;
      }

      if (cha.ngung) them('Bộ phận cha đã ngưng hoạt động');

      const chaHopLe = CHA_HOP_LE[nut.loai as LoaiBoPhan] ?? [];
      if (!chaHopLe.includes(cha.loai as LoaiBoPhan)) {
        them(`${nut.loai} không thể nằm dưới ${cha.loai}`);
      }

      // đi ngược lên cha, gặp lại nút đã đi qua là có vòng lặp
      const daDi = new Set<Nut>([nut]);
      let x: KetQuaTimCha | null = cha;
      while (x && x !== 'KHONG' && x !== 'NHIEU') {
        if (daDi.has(x)) {
          them('Tạo vòng lặp trong cây tổ chức');
          break;
        }
        daDi.add(x);
        x = chaCua(x);
      }
    }

    return loi;
  }

  async ghi(cacDong: DongExcel[], tx: Prisma.TransactionClient): Promise<void> {
    const dsDb = await tx.boPhan.findMany({ select: { id: true, ma: true, ten: true, loai: true } });
    const maDaDung = new Set(dsDb.map((b) => b.ma));
    const idCuaDong = new Map<number, string>();

    // Lượt 1: tạo hoặc cập nhật, chưa gán cha
    for (const d of cacDong) {
      const g = d.giaTri;
      const ten = this.chuoi(g['Tên']);
      const loai = this.chuoi(g['Loại']) as LoaiBoPhan;
      const maFile = this.chuoi(g['Mã']).toUpperCase();
      const du = { ten, loai, nhom: tinhNhom(loai, null, this.chuoi(g['Nhóm']) || null) };

      const cu = maFile
        ? dsDb.find((b) => b.ma.toUpperCase() === maFile)
        : dsDb.find((b) => b.loai === loai && boDau(b.ten) === boDau(ten));

      if (cu) {
        await tx.boPhan.update({ where: { id: cu.id }, data: du });
        idCuaDong.set(d.dong, cu.id);
        continue;
      }

      const ma = maFile || sinhMaBoPhan(ten, loai, maDaDung);
      if (!ma) throw new BadRequestException(`Dòng ${d.dong}: không sinh được mã`);

      const moi = await tx.boPhan.create({ data: { ma, ...du } });
      maDaDung.add(ma);
      dsDb.push({ id: moi.id, ma, ten, loai });
      idCuaDong.set(d.dong, moi.id);
    }

    // Lượt 2: gán cha (cha nằm trong file hoặc đã có trong DB, giờ đều đã có trong DB)
    const dsSau = await tx.boPhan.findMany({ select: { id: true, ma: true, ten: true, nhom: true } });

    for (const d of cacDong) {
      const g = d.giaTri;
      const id = idCuaDong.get(d.dong);
      if (!id) continue;

      const loai = this.chuoi(g['Loại']) as LoaiBoPhan;
      const chaChu = this.chuoi(g['Bộ phận cha']);

      let cha: (typeof dsSau)[number] | null = null;
      if (chaChu) {
        const theoMa = dsSau.filter((b) => b.ma.toUpperCase() === chaChu.toUpperCase());
        const theoTen = dsSau.filter((b) => boDau(b.ten) === boDau(chaChu));
        cha = theoMa.length === 1 ? theoMa[0] : theoTen.length === 1 ? theoTen[0] : null;
        if (!cha) throw new BadRequestException(`Dòng ${d.dong}: không xác định được bộ phận cha "${chaChu}"`);
      }

      await tx.boPhan.update({
        where: { id },
        data: {
          boPhanChaId: cha?.id ?? null,
          nhom: tinhNhom(loai, cha?.nhom ?? null, this.chuoi(g['Nhóm']) || null),
        },
      });
    }
  }
}
