import { boPhanApi } from "@/services/bo-phan.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { themThanhVienBody, SuaThanhVienBody, CapNhatNgayKetThucBody, taoBoPhanBody, suaBoPhanBody, ngungHoatDongBody } from "@/features/boPhan/type/boPhan.type";
import { toast } from "sonner";
import { layThongBaoLoi } from "@/utils/lay-thong-bao";

export const useCayBoPhan = (baoGomDungHoatDong: boolean) => {
  return useQuery({
    queryKey: ["bo-phan", "cay", baoGomDungHoatDong], // đặt tên cho dữ liệu để React Query quản lý.
    queryFn: () => boPhanApi.getCayBoPhan(baoGomDungHoatDong), // chỉ định hàm gọi API.
  });
};

export const useBoPhan = (id: string | null) => {
  return useQuery({
    queryKey: ["bo-phan", id],
    enabled: !!id,
    queryFn: () => boPhanApi.getBoPhan(id as string),
  });
};

export const useDsThanhVien = (id: string | null, baoGomDaKetThuc: boolean) => {
  return useQuery({
    queryKey: ['bo-phan', id, 'thanhVien', baoGomDaKetThuc],
    queryFn: () => boPhanApi.getDsThanhVien(id as string, baoGomDaKetThuc),
    enabled: !!id
  })
}

export const useThieuLanhDao = () => {
  return useQuery({
    queryKey: ['bo-phan', 'thieu-lanh-dao'],
    queryFn: () => boPhanApi.getThieuLanhDao(),
    retry: false
  })
}

export const useVaiTroCoTheGan = (boPhanId: string | null, enable: boolean) => {
  return useQuery({
    queryKey: ['bo-phan', boPhanId, 'vai-tro'],
    queryFn: () => boPhanApi.getVaiTroCoTheGan(boPhanId as string),
    enabled: !!boPhanId && enable // biến enable dùng cho việc hàm này chỉ chạy khi Dialog được mở
  })
}

export const useUngVien = (boPhanId: string | null, tuKhoa: string) => {
  return useQuery({
    queryKey: ['bo-phan', boPhanId, 'ung-vien', tuKhoa],
    queryFn: () => boPhanApi.getUngVien(boPhanId as string, tuKhoa),
    enabled: !!boPhanId && tuKhoa.trim().length >=2 //chi hoat dong ki tu khoa >= 2
  })
}

export const useThemThanhVien = (boPhanId: string | null) => {

  const queryClient = useQueryClient(); // thằng này dùng cho trigger mấy cái useQuery ở trên để cập nhật cho mấy cái query đó

  return useMutation({
    mutationFn: (body: themThanhVienBody) => boPhanApi.postThemThanhVien(boPhanId as string, body),

    //khi thành công thì cần tải thằng nào
    //invalidateQueries cái key của thằng đó
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', boPhanId, 'thanhVien'], //tai lai ds thanh vien
      })
      
      //cap nhat lai danh sach ung vien
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', boPhanId, 'ung-vien']
      })

      queryClient.invalidateQueries({
        queryKey: ['bo-phan', 'thieu-lanh-dao'], // tai lai bo phan thieu
      })
      toast.success("Thêm thành viên vào bộ phận thành công");
    },

    onError: (error) => {
      toast.error(layThongBaoLoi(error));
    }

  })
}

export const useSuaThanhVien = (boPhanId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nguoiDungId, body }: { nguoiDungId: string, body: SuaThanhVienBody }) => boPhanApi.patchSuaThanhVien(boPhanId as string, nguoiDungId, body),

    onSuccess: () => {
      //cap nhat lai danh sach thanh vien
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', boPhanId, 'thanhVien']
      })

      //re-check bo phan thieu lanh dao
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', 'thieu-lanh-dao']
      })

      toast.success("Cập nhật thông tin thành công");
    },

    onError: (e) => {
      toast.error(layThongBaoLoi(e));
    }
  })
}

/**Cập nhật ngày kết thúc của thành viên bộ phận */
export const useCapNhatNgayKetThuc = (boPhanId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({nguoiDungId, body}: { nguoiDungId: string, body: CapNhatNgayKetThucBody}) => boPhanApi.patchCapNhatNgayKetThuc(boPhanId as string, nguoiDungId, body),

    onSuccess: () => {
      // cap nhat lai danh sach thanh vien
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', boPhanId, 'thanhVien']
      })

      // re-check bo phan thieu lanh dao
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', 'thieu-lanh-dao']
      })

      //cap nhat lai ung vien, vi nguoi nay co the quay lai lam
      queryClient.invalidateQueries({
        queryKey: ['bo-phan', boPhanId, 'ung-vien']
      })

      toast.success("Cập nhật ngày kết thúc thành công");
    },

    onError: (e) => {
      toast.error(layThongBaoLoi(e));
    }
  })
}

export const useTaoBoPhan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: taoBoPhanBody) => boPhanApi.postTaoBoPhan(body),

    //update lai het cac query co key bo phan
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bo-phan']
      })

      toast.success("Tạo bộ phận thành công", {
        description: new Date().toLocaleString(),
      });
    },

    onError: (error) => {
      toast.error(layThongBaoLoi(error));
    }
  })
}

export const useSuaBoPhan = (boPhanId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: suaBoPhanBody) => boPhanApi.patchSuaBoPhan(boPhanId as string, body),

    //update lai het cac query co key bo phan
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bo-phan']
      })

      toast.success("Cập nhật bộ phận thành công",
        { description: new Date().toLocaleString(), }
      );
    },

    onError: (error) => {
      toast.error(layThongBaoLoi(error));
    }
  })
}

/**Cập nhật trạng thái của bộ phận (Ngưng hoạt động) */
export const useCapNhatTrangThai = (boPhanId: string | null) => {
  const queryClient = useQueryClient();

   return useMutation({
    mutationFn: (body: ngungHoatDongBody) => boPhanApi.patchTrangThaiBoPhan(boPhanId as string, body),

    //update lai het cac query co key bo phan
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bo-phan']
      })

      toast.success("Cập nhật bộ phận thành công", {
        description: new Date().toLocaleString(),
      });
    },

    onError: (error) => {
      toast.error(layThongBaoLoi(error));
    }
  })
}
