"use client"
import { useState } from "react"
import BoPhanTree from "./bo-phan-tree";
import BoPhanChiTiet from "./thong-tin-chung/bo-phan-chi-tiet"
import  BoPhanThanhVien  from "./thanh-vien/bo-phan-thanh-vien";
import DialogBoPhan from "./thong-tin-chung/dialog/dialog-bo-phan";
import type { boPhanType } from "@/features/boPhan/type/boPhan.type";
export default function QuanLyBoPhan(){
    
    const [boPhanDangChon, setBoPhanDangChon] = useState<string | null>(null);
    const [dialogMo, setDialogMo] = useState(false);
    const [boPhanDangSua, setBoPhanDangSua] = useState<boPhanType | null>(null);

    const themBoPhan = () => {
        setBoPhanDangSua(null);
        setDialogMo(true);
    };

    const suaBoPhan = (boPhan: boPhanType) => {
        setBoPhanDangSua(boPhan);
        setDialogMo(true);
    };

    return(
        <div className="flex h-full mx-4 my-2 rounded-xl border-1">
            <BoPhanTree boPhanDangChon={boPhanDangChon} onChon={setBoPhanDangChon} onThem={themBoPhan} />

            {boPhanDangChon ? (
                <div className="flex flex-col flex-1">
                    <BoPhanChiTiet boPhanId={boPhanDangChon} onSua={suaBoPhan} />
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
            <DialogBoPhan open={dialogMo} onOpenChange={setDialogMo} boPhan={boPhanDangSua} />
        </div>
    )
}
