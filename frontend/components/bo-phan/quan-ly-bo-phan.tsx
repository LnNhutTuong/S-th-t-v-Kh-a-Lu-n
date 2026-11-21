"use client"
import { useState } from "react"
import BoPhanTree from "./bo-phan-tree";
import BoPhanChiTiet from "./thong-tin-chung/bo-phan-chi-tiet"
import  BoPhanThanhVien  from "./thanh-vien/bo-phan-thanh-vien";
export default function QuanLyBoPhan(){
    
    const [boPhanDangChon, setBoPhanDangChon] = useState<string | null>(null);

    return(
        <div className="flex h-full mx-4 my-2 rounded-xl border-1">
            <BoPhanTree boPhanDangChon={boPhanDangChon} onChon={setBoPhanDangChon} />

            {boPhanDangChon ? (
                <div className="flex flex-col flex-1">
                    <BoPhanChiTiet boPhanId={boPhanDangChon} />
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
        </div>
    )
}