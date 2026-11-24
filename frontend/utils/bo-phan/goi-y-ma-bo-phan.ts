import { LoaiBoPhan, TEN_LOAI_BO_PHAN, TIEN_TO_MA } from "@/features/boPhan/type/boPhan.type";
import { boDau } from "../xu-ly-chuoi";
export const goiYMaBoPhan = (ten: string, loai: LoaiBoPhan | "", cacMaDaCo: Set<string>): string => {
    const tenBp = ten.trim();

    if(tenBp === "" || loai === ""){
        return "";
    }

    if(loai === LoaiBoPhan.BAN_GIAM_HIEU){
        return "BGH";
    }
    
    const tachTu = (s: string): string[] => 
        boDau(s).split(/[^a-z0-9]+/).filter(Boolean);

    let tu = tachTu(tenBp);

    const tuLoai = tachTu(TEN_LOAI_BO_PHAN[loai]);
    if (tu.slice(0, tuLoai.length).join(" ") === tuLoai.join(" ")) {
        tu = tu.slice(tuLoai.length); 
    }

    const tuNoi = new Set(['va', 'cua'])
    tu = tu.filter((t) => !tuNoi.has(t))

    let vietTat = "";
    if(tu.length === 0) return vietTat;
    else if(tu.length === 1){
        vietTat = tu[0].toUpperCase();
    } else{ //tu la mang, va chay map cac t trong tu va lay vi tri thu 0, join ""
        vietTat = tu.map((t) => t[0]).join("").toUpperCase();
    }

    const goc = `${TIEN_TO_MA[loai]}_${vietTat}`.toUpperCase();

    let ma = goc;
    let n = 2; 
    while (cacMaDaCo.has(ma)) { 
        ma = `${goc}_${n++}`; 
    } 
    return ma;

}