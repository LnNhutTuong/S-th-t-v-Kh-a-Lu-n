import { LoaiNhapExcel } from "../../generated/prisma/enums.js";
import { CotExcel, DongExcel } from "../../excel/type/excel.type.js";

export interface LoiExcel{
    dong: number;
    cot: string;
    thongBao: string
}

export interface ImporterExcel{
    loai: LoaiNhapExcel,
    cot: CotExcel[],
    kiemTra(dong: DongExcel): LoiExcel[]; //method
    ghi(cacDong: DongExcel[], tx: unknown): Promise<void> //method
    cotKhoa?: string; //cột báo lỗi khi trùng khóa (ví dụ cột Tên, cột Email)
    // khóa của một dòng (viết thường). Không có thì lấy giá trị ở cột cotKhoa
    layKhoa?: (dong: DongExcel) => string | null;
    // nhận danh sách khóa trong file, trả về những khóa có trong DB
    timKhoaDaCo?: (cacKhoa: string[]) => Promise<Set<string>> 
    kiemTraCaFile?: (cacDong: DongExcel[]) => Promise<LoiExcel[]>;
}