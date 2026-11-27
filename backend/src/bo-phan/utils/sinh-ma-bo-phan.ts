import type { LoaiBoPhan, NhomDonVi } from '../../generated/prisma/enums.js';

// Bản backend của frontend/utils/bo-phan/goi-y-ma-bo-phan.ts, giữ cùng thuật toán

export const boDau = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');

export const TEN_LOAI_BO_PHAN: Record<LoaiBoPhan, string> = {
  BAN_GIAM_HIEU: 'Ban giám hiệu',
  KHOA: 'Khoa',
  BO_MON: 'Bộ môn',
  PHONG: 'Phòng',
  VIEN: 'Viện',
  TRUNG_TAM: 'Trung tâm',
  THU_VIEN: 'Thư viện',
  TRUONG: 'Trường',
};

export const TIEN_TO_MA: Record<LoaiBoPhan, string> = {
  BAN_GIAM_HIEU: 'BGH',
  KHOA: 'KHOA',
  BO_MON: 'BM',
  PHONG: 'PHONG',
  VIEN: 'VIEN',
  TRUNG_TAM: 'TT',
  THU_VIEN: 'TV',
  TRUONG: 'TRUONG',
};

// Viết hoa chữ cái đầu mỗi từ + gắn tiền tố loại (giống FE ChuanHoaTenBp)
export const chuanHoaTenBp = (ten: string, loai: LoaiBoPhan): string => {
  const tenGoc = ten.trim();
  if (!tenGoc || loai === 'BAN_GIAM_HIEU') return tenGoc;

  const tuGoc = tenGoc.split(/\s+/);
  const tuLoai = TEN_LOAI_BO_PHAN[loai].split(' ');

  const daCo = tuLoai.every((t, i) => tuGoc[i] !== undefined && boDau(tuGoc[i]) === boDau(t));
  const conLai = daCo ? tuGoc.slice(tuLoai.length) : [...tuGoc];

  const hoaMoiTu = conLai.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  return [...tuLoai, ...hoaMoiTu].join(' ');
};

// Trả về '' nếu không sinh được (tên rỗng hoặc chỉ có mỗi từ chỉ loại)
export const sinhMaBoPhan = (ten: string, loai: LoaiBoPhan, cacMaDaCo: Set<string>): string => {
  const tenBp = ten.trim();
  if (tenBp === '') return '';
  if (loai === 'BAN_GIAM_HIEU') return 'BGH';

  const tachTu = (s: string): string[] => boDau(s).split(/[^a-z0-9]+/).filter(Boolean);

  let tu = tachTu(tenBp);

  // bỏ từ chỉ loại ở đầu tên: "Khoa Công nghệ" -> "Công nghệ"
  const tuLoai = tachTu(TEN_LOAI_BO_PHAN[loai]);
  if (tu.slice(0, tuLoai.length).join(' ') === tuLoai.join(' ')) {
    tu = tu.slice(tuLoai.length);
  }

  const tuNoi = new Set(['va', 'cua']);
  tu = tu.filter((t) => !tuNoi.has(t));
  if (tu.length === 0) return '';

  const vietTat =
    tu.length === 1
      ? tu.join('').toUpperCase()
      : tu.map((t) => t.charAt(0)).join('').toUpperCase();

  const goc = `${TIEN_TO_MA[loai]}_${vietTat}`.toUpperCase();

  let ma = goc;
  let n = 2;
  while (cacMaDaCo.has(ma)) {
    ma = `${goc}_${n++}`;
  }
  return ma;
};

// Giống BoPhanService.setNhom nhưng là hàm thuần
export const tinhNhom = (
  loai: LoaiBoPhan,
  nhomCha: NhomDonVi | null,
  nhomGui?: string | null,
): NhomDonVi | null => {
  if (loai === 'BAN_GIAM_HIEU') return null;
  if (loai === 'KHOA') return 'DAO_TAO';
  if (loai === 'BO_MON') return nhomCha ?? 'DAO_TAO';
  if (loai === 'PHONG' || loai === 'THU_VIEN') return 'CHUC_NANG';
  return (nhomGui as NhomDonVi | null) ?? 'SU_NGHIEP'; // Viện, Trường, Trung tâm
};
