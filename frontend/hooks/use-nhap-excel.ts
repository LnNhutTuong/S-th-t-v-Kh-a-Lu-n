import { useMutation, useQueryClient } from "@tanstack/react-query"
import { nhapExcelApi } from "@/services/nhap-excel.service"
import { LoaiNhapExcel } from "@/features/nhap-excel/type/nhap-excel.type"
import { layThongBaoLoi } from "@/utils/lay-thong-bao"
import { toast } from "sonner"

export const useXemTruocExcel = () => {
    return useMutation({
        mutationFn: ({loai, file}: {loai: LoaiNhapExcel, file: File}) => nhapExcelApi.postXemTruoc(loai, file),

        onError:(e)=>{
            toast.error(layThongBaoLoi(e))
        }
    })
}

export const useDuyetPhienExcel = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => nhapExcelApi.postDuyetPhien(id),

        onSuccess: () => {
            toast.success("Duyệt phiên thành công")

            queryClient.invalidateQueries()
        },

        onError:(e) => {
            toast.error(layThongBaoLoi(e))
        }
    })
}

export const useHuyPhienExcel = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => nhapExcelApi.postHuyPhien(id),

        onSuccess: () => {
            toast.success("Hủy phiên thành công")

            queryClient.invalidateQueries()
        },

        onError:(e) => {
            toast.error(layThongBaoLoi(e))
        }
    })
}