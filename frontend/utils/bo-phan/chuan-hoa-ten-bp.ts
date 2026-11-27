import { LoaiBoPhan, TEN_LOAI_BO_PHAN } from "@/features/bo-phan/type/boPhan.type";
import { boDau } from "../xu-ly-chuoi";

export const ChuanHoaTenBp = (ten:string, loai: string): string => {
    const tenGoc= ten.trim();
    const nhanLoai = TEN_LOAI_BO_PHAN[loai as LoaiBoPhan];

    if(!tenGoc || !nhanLoai || loai === LoaiBoPhan.BAN_GIAM_HIEU){
        return tenGoc;
    }

    const tuGoc = tenGoc.split(/\s+/);

    const tuLoai = nhanLoai.split(" ");

    const daCo = tuLoai.every((t, i) => tuGoc[i] !== undefined && boDau(tuGoc[i]) === boDau(t));

    const conLai = daCo ? tuGoc.slice(tuLoai.length) : [...tuGoc];

    const hoaMoiTu = conLai.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    return [...tuLoai, ...hoaMoiTu].join(" ");

}