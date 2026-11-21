import { boPhanType, boPhanTreeType, thanhVienBoPhanType, thieuLanhDaoType, vaiTroCoTheGanType, ungVienType, themThanhVienBody, themThanhVienResponse, SuaThanhVienBody, SuaThanhVienResponse, CapNhatNgayKetThuaBody, CapNhatNgayKetThuaResponse } from "@/features/boPhan/type/boPhan.type";
import { clientApi } from "@/lib/axios/client";

export const boPhanApi = {
    //truyen them params
    getCayBoPhan: async (baoGomDungHoatDong: boolean) => {
        const {data} =  await clientApi.get<boPhanTreeType[]>('/bo-phan', { // const {data}: lấy data trong cục be trả về
            params: {baoGomDungHoatDong} // param là param
        })
        return data; // giúp hook nhận cục data chứ ko phải Axios Response
    },

    getBoPhan: async (id: string) => {
        const {data} =  await clientApi.get<boPhanType>(`/bo-phan/${id}`)
        return data;
    },

    getDsThanhVien: async (boPhanId: string, baoGomDaKetThuc: boolean) => {
        const {data} = await clientApi.get<thanhVienBoPhanType[]>(`/bo-phan/${boPhanId}/thanh-vien`,{
            params: {baoGomDaKetThuc}
        })
        return data;
    },

    getThieuLanhDao: async () => {
        const {data} = await clientApi.get<thieuLanhDaoType>(`/bo-phan/thieu-lanh-dao`);
        return data;
    },

    getVaiTroCoTheGan: async (boPhanId: string) => {
        const {data} = await clientApi.get<vaiTroCoTheGanType[]>(`/bo-phan/${boPhanId}/vai-tro-co-the-gan`);
        return data;
    },

    getUngVien: async (boPhanId: string, tuKhoa: string) => {
        const {data} = await clientApi.get<ungVienType[]>(`/bo-phan/${boPhanId}/ung-vien`,{
            params: {tuKhoa}
        })
        return data;
    },

    postThemThanhVien: async (boPhanId: string, body: themThanhVienBody) => {
        const{data} = await clientApi.post<themThanhVienResponse>(`/bo-phan/${boPhanId}/thanh-vien`,body);
        return data;
    },

    patchSuaThanhVien: async (boPhanId: string, nguoiDungId: string, body: SuaThanhVienBody) => {
        const {data} = await clientApi.patch<SuaThanhVienResponse>(`/bo-phan/${boPhanId}/thanh-vien/${nguoiDungId}`, body)
        return data;
    },

    patchCapNhatNgayKetThuc: async (boPhanId: string, nguoiDungId: string, body: CapNhatNgayKetThuaBody) => {
        const {data} = await clientApi.patch<CapNhatNgayKetThuaResponse>(`/bo-phan/${boPhanId}/thanh-vien/${nguoiDungId}/ket-thuc`, body)
        return data
    }
}   

