export const LoaiNhapExcel = {
  BO_PHAN: 'BO_PHAN',
  NGUOI_DUNG: 'NGUOI_DUNG',
  NHIEM_VU: 'NHIEM_VU',
  DE_TAI: 'DE_TAI'
} as const

export type LoaiNhapExcel = (typeof LoaiNhapExcel)[keyof typeof LoaiNhapExcel]


export type LoiExcelType = {
    dong: number;
    cot: string;
    thongBao: string
}

export type TomTatType = {
    tongDong: number;
    soLoi: number;
    soTaoMoi: number;
    soCapNhat: number;
}

export type DongXemTruocType = {
  dong: number,
  giaTri: Record<string, unknown>, 
  suyRa?: Record<string, unknown>
}

export type PhienNhapExcelType = {
  id: string,
  loai: LoaiNhapExcel,
  tenFile: string, 
  trangThai: ('XEM_TRUOC' | 'LOI' | 'DA_DUYET' | 'DA_HUY'), 
  duLieuXemTruoc: DongXemTruocType[], 
  loi: LoiExcelType[],
  tomTat: TomTatType,
  hetHanLuc: string
}

