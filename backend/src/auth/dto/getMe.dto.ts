import { CapBac } from "../../generated/prisma/enums.js";

export class getMeDto{  
  id: string;
  email: string;
  ten: string;
  anhDaiDien: string | null;
  laAdmin: boolean;
  boPhan: {
    idBoPhan: string;
    tenBoPhan: string;
    vaiTro: { ma: string; ten: string };
    capBac: CapBac;
    quyen: string[];        // các mã như 'nhiem_vu.tao'
  }[];
}