import { LoaiNhapExcel } from "@/features/nhap-excel/type/nhap-excel.type";
import { clientApi } from "@/lib/axios/client";

export const nhapExcelApi = {

    async postXemTruoc(loai: LoaiNhapExcel, file: File) {
        const data = new FormData();
        data.append('file', file);
        
        const {data: phien} = await clientApi.post(`/nhap-excel/${loai}/xem-truoc`, data);
        return phien;
    },

    async postDuyetPhien(id: string){
        const {data} = await clientApi.post(`/nhap-excel/phien/${id}/duyet`);

        return data;
    },

    async postHuyPhien(id: string){
        const {data} = await clientApi.post(`/nhap-excel/phien/${id}/huy`);

        return data;
    }
}