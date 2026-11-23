export const LoaiBoPhan = {
  BAN_GIAM_HIEU: 'BAN_GIAM_HIEU',
  KHOA: 'KHOA',
  BO_MON: 'BO_MON',
  PHONG: 'PHONG',
  VIEN: 'VIEN',
  TRUNG_TAM: 'TRUNG_TAM',
  THU_VIEN: 'THU_VIEN',
  TRUONG: 'TRUONG'
} as const

export type LoaiBoPhan = (typeof LoaiBoPhan)[keyof typeof LoaiBoPhan]

export const TEN_LOAI_BO_PHAN: Record<LoaiBoPhan, string> = {
  [LoaiBoPhan.BAN_GIAM_HIEU]: "Ban giám hiệu",
  [LoaiBoPhan.KHOA]: "Khoa",
  [LoaiBoPhan.BO_MON]: "Bộ môn",
  [LoaiBoPhan.PHONG]: "Phòng",
  [LoaiBoPhan.VIEN]: "Viện",
  [LoaiBoPhan.TRUNG_TAM]: "Trung tâm",
  [LoaiBoPhan.THU_VIEN]: "Thư viện",
  [LoaiBoPhan.TRUONG]: "Trường",
};

export const TIEN_TO_MA: Record<LoaiBoPhan, string> = {
  [LoaiBoPhan.BAN_GIAM_HIEU]: "BGH",
  [LoaiBoPhan.KHOA]: "KHOA",
  [LoaiBoPhan.BO_MON]: "BM",
  [LoaiBoPhan.PHONG]: "PHONG",
  [LoaiBoPhan.VIEN]: "VIEN",
  [LoaiBoPhan.TRUNG_TAM]: "TT",
  [LoaiBoPhan.THU_VIEN]: "TV",
  [LoaiBoPhan.TRUONG]: "TRUONG",
};

//Phải có cái này vì có trường hợp có trung tâm bên sự nghiệp và có bên chức năng nữa~ 
export const LoaiBpCanChonNhom: LoaiBoPhan[] = [LoaiBoPhan.TRUNG_TAM, LoaiBoPhan.TRUONG, LoaiBoPhan.VIEN];

export const NhomDonVi = {
  DAO_TAO: 'DAO_TAO',
  CHUC_NANG: 'CHUC_NANG',
  SU_NGHIEP: 'SU_NGHIEP'
} as const

export type NhomDonVi = (typeof NhomDonVi)[keyof typeof NhomDonVi]

export const TEN_NHOM: Record<NhomDonVi, string> = {
  [NhomDonVi.CHUC_NANG]: "KHỐI PHÒNG, BAN CHỨC NĂNG",
  [NhomDonVi.DAO_TAO]: "KHỐI KHOA CHUYÊN MÔN",
  [NhomDonVi.SU_NGHIEP]: "KHỐI TRUNG TÂM & ĐƠN VỊ TRỰC THUỘC",
};

export const THU_TU_NHOM: NhomDonVi[] = [
  NhomDonVi.CHUC_NANG,
  NhomDonVi.DAO_TAO,
  NhomDonVi.SU_NGHIEP,
];

export const TEN_NHOM_BO_PHAN: Record<NhomDonVi, string> = {
  [NhomDonVi.DAO_TAO]: "Khối khoa chuyên môn",
  [NhomDonVi.CHUC_NANG]: "Khối phòng, ban chức năng",
  [NhomDonVi.SU_NGHIEP]: "Khối trung tâm và đơn vị trực thuộc",
};

export const CHA_HOP_LE: Record<LoaiBoPhan, LoaiBoPhan[]> = {
  [LoaiBoPhan.BAN_GIAM_HIEU]: [],
  [LoaiBoPhan.KHOA]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.PHONG]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.VIEN]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.TRUNG_TAM]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.THU_VIEN]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.TRUONG]: [LoaiBoPhan.BAN_GIAM_HIEU],
  [LoaiBoPhan.BO_MON]: [LoaiBoPhan.KHOA, LoaiBoPhan.BAN_GIAM_HIEU],
};

export const CapBac = {
  TRUONG: 'TRUONG',
  PHO: 'PHO',
  THANH_VIEN: 'THANH_VIEN'
} as const

export type CapBac = (typeof CapBac)[keyof typeof CapBac]

export const TenCapBac: Record<CapBac, string> = {
  [CapBac.TRUONG]: "Trưởng",
  [CapBac.PHO]: "Phó",
  [CapBac.THANH_VIEN]: "Thành viên"
}

export type boPhanType = {
    id: string,
    ma: string,
    ten: string,
    loai: LoaiBoPhan,
    nhom: NhomDonVi | null, // gào ban giám hiệu (null 2 cái này, vì cha 1)
    boPhanChaId: string | null,
    ngungHoatDong: boolean,
    thongTinThem: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
    boPhanCha:{ ma: string; ten: string } | null
}

export type boPhanTreeType = {
    id: string,
    ma: string,
    ten: string,
    loai: LoaiBoPhan,
    nhom: NhomDonVi | null,
    boPhanChaId: string | null,
    ngungHoatDong: boolean,
    thongTinThem: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
    con: boPhanTreeType[],
}

export type thanhVienBoPhanType = {
  boPhanId: string,
  capBac: CapBac,
  ngayThamGia: string,
  ngayKetThuc: string | null,
  nguoiDung: {
    id: string,
    email: string,
    ten: string
  },
  vaiTro: {
    id: string,
    ten: string
  }
}

export type boPhanThieuLanhDaoType = {
  id: string,
  ma: string,
  ten: string,
  loai: LoaiBoPhan,
  thieuTruong: boolean,
  thieuPho: boolean
}

export type thieuLanhDaoType = {
  tongBoPhanDaKiem: number,
  soBoPhanThieu: number,
  danhSachBoPhanThieu: boPhanThieuLanhDaoType[]
}

export type vaiTroCoTheGanType =  {
  id: string,
  ten: string,
  capBac: CapBac,
  soLuongToiDa: number
}

export type ungVienType = {
  id: string,
  ten: string,
  email: string
}

export type themThanhVienBody = {
    nguoiDungId: string,
    vaiTroId: string
}

export type themThanhVienResponse = {
  nguoiDungId: string,
  boPhanId: string,
  vaiTroId: string,
  capBac: CapBac,
  ngayThamGia: Date,
  ngayKetThuc: Date | null
}

export type SuaThanhVienBody ={
  ngayThamGia?: Date,
  vaiTroId?: string
}

export type SuaThanhVienResponse = {
    nguoiDungId: string,
    boPhanId: string,
    vaiTroId: string,
    capBac: CapBac,
    ngayThamGia: Date ,
    ngayKetThuc: Date | null
}

export type CapNhatNgayKetThucBody = {
  ngayKetThuc?: string
}

export type CapNhatNgayKetThuaResponse = {
    nguoiDungId: string,
    boPhanId: string,
    vaiTroId: string,
    capBac: CapBac,
    ngayThamGia: Date,
    ngayKetThuc: Date
}

export type taoBoPhanBody = {
  ma: string,
  ten: string,
  loai: LoaiBoPhan,
  boPhanChaId?: string,
  nhom?: NhomDonVi
}

export type taoBoPhanResponse = Omit<boPhanType, 'boPhanCha'>

export type suaBoPhanBody = {
  ten?: string,
  boPhanChaId?: string,
  nhom?: NhomDonVi
}

export type suaBoPhanResponse = Omit<boPhanType, 'boPhanCha'>

export type ngungHoatDongBody = {
  ngungHoatDong: boolean
}

export type ngungHoatDongResponse = Omit<boPhanType, 'boPhanCha'>



