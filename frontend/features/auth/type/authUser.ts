export type QuyenTaiBoPhan = {
  idBoPhan: string;
  tenBoPhan: string;
  vaiTro: { 
    ma: string;
    ten: string 
  };
  capBac: "TRUONG" | "PHO" | "THANH_VIEN";
  quyen: string[];
};

export type AuthUser = {
  id: string;
  email: string;
  ten: string;
  anhDaiDien: string | null;
  laAdmin: boolean;
  boPhan: QuyenTaiBoPhan[];
};