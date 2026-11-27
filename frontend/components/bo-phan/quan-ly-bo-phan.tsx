"use client"
import { useState } from "react"
import BoPhanTree from "./bo-phan-tree";
import BoPhanChiTiet from "./thong-tin-chung/bo-phan-chi-tiet"
import  BoPhanThanhVien  from "./thanh-vien/bo-phan-thanh-vien";
import DialogBoPhan from "./thong-tin-chung/dialog/dialog-bo-phan";
import DialogNgungHoatDong from "./thong-tin-chung/dialog/ngung-hoat-dong";
import type { boPhanType } from "@/features/bo-phan/type/boPhan.type";
import DialogNhapExcel from "@/components/nhap-excel/dialog-nhap-excel";
import { LoaiNhapExcel } from "@/features/nhap-excel/type/nhap-excel.type";

export default function QuanLyBoPhan(){
    
    const [boPhanDangChon, setBoPhanDangChon] = useState<string | null>(null);
    const [dialogMo, setDialogMo] = useState(false);
    const [dialogNhapExcelMo, setDialogNhapExcelMo] = useState(false);
    const [boPhanDangSua, setBoPhanDangSua] = useState<boPhanType | null>(null);
    const [boPhanCapNhatTrangThai, setBoPhanCapNhatTrangThai] = useState<boPhanType | null>(null);

    const [chaMacDinh, setChaMacDinh] = useState<string | undefined>(undefined);

    const themBoPhan = () => {
        setBoPhanDangSua(null);
        setChaMacDinh(undefined);
        setDialogMo(true);
    };

    const themBoPhanCon = (boPhanChaId: string) => {
        setBoPhanDangSua(null);
        setChaMacDinh(boPhanChaId);
        setDialogMo(true);
    }

    const suaBoPhan = (boPhan: boPhanType) => {
        setBoPhanDangSua(boPhan);
        setDialogMo(true);
    };

    const ngungHoatDong = (boPhan: boPhanType) => {
        setBoPhanCapNhatTrangThai(boPhan);
    };

    return(
        <div className="flex h-full mx-4 my-2 rounded-xl border-1">
            <BoPhanTree boPhanDangChon={boPhanDangChon} onChon={setBoPhanDangChon} onThem={themBoPhan} onThemExcel={() => setDialogNhapExcelMo(true)} />

            {boPhanDangChon ? (
                <div className="flex flex-col flex-1">
                    <BoPhanChiTiet boPhanId={boPhanDangChon} onSua={suaBoPhan} onNgungHoatDong={ngungHoatDong} onThemCon={themBoPhanCon} />
                    <BoPhanThanhVien boPhanId={boPhanDangChon}/>
                </div>
            ): 
                <section className="flex min-w-0 flex-1 items-center justify-center pt-6 py-10 text-center">
                    <div className="max-w-sm space-y-2">
                        <h2 className="text-base font-semibold">Chi tiết bộ phận</h2>
                        <p className="text-sm text-muted-foreground">
                            Chọn một bộ phận trong   cây bên trái để xem thông tin.
                        </p>
                    </div>
                </section>
            }
            <DialogBoPhan open={dialogMo} onOpenChange={setDialogMo} boPhan={boPhanDangSua} boPhanChaMacDinh={chaMacDinh}/>
            <DialogNhapExcel loai={LoaiNhapExcel.BO_PHAN} open={dialogNhapExcelMo} onOpenChange={setDialogNhapExcelMo} />
            <DialogNgungHoatDong boPhan={boPhanCapNhatTrangThai} onOpenChange={(open) => {
                if (!open) setBoPhanCapNhatTrangThai(null);
            }} />
        </div>
    )
}
