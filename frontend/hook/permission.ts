"use client";

import { useAuth } from "./auth";
import type { MaQuyen } from "@/constants/quyen";

export const usePermission = () => {
  const { user, isLoading } = useAuth();

  // Dùng cho menu chung: có quyền này ở BẤT KỲ bộ phận nào không?
  const coQuyen = (maQuyen: MaQuyen): boolean => {
    // 1. Chưa có user
    if (!user) {
      return false;
    }
    // 2. user.laAdmin
    if (user.laAdmin) {
      return true;
    }
    // 3. Có bộ phận nào chứa maQuyen trong mảng quyen không?
    const quyen = user.boPhan.some((b) => b.quyen.includes(maQuyen)); // some -> boolean
    return quyen;
  };

  // Dùng cho nút ở trang của MỘT bộ phận cụ thể
  const coQuyenTaiBoPhan = (maQuyen: MaQuyen, boPhanId?: string): boolean => {
    // 1. Chưa có user HOẶC boPhanId rỗng → ____
    if(!user || !boPhanId){
        return false
    }
    // 2. user.laAdmin → ____
    if(user.laAdmin){
        return true
    }
    // 3. Tìm đúng bộ phận có idBoPhan === boPhanId, rồi xem quyen của nó có maQuyen không
    const bp = user.boPhan.find(b => b.idBoPhan === boPhanId)
    if(!bp){
        return false
    }
    return bp.quyen.includes(maQuyen)
  };

  return { coQuyen, coQuyenTaiBoPhan, laAdmin: user?.laAdmin ?? false, isLoading };
};