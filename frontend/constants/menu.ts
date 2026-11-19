import { Building2, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QUYEN } from "@/constants/quyen";
import type { MaQuyen } from "@/constants/quyen";

// ==============================================================================
// DANH SÁCH MỤC MENU THANH BÊN
// - quyen:    chỉ hiện mục khi người dùng có quyền này ở bất kỳ bộ phận nào (FE-5 mới dùng).
// - chiAdmin: chỉ hiện cho ADMIN (dùng cho trang mà backend khóa bằng AdminGuard).
// - Không có cả hai: ai đăng nhập cũng thấy.
// Chỉ thêm mục khi trang tương ứng đã có, để bấm vào không bị 404.
// ==============================================================================

export type MucMenu = {
  ten: string;
  duongDan: string;
  icon: LucideIcon;
  quyen?: MaQuyen;
  chiAdmin?: boolean;
};

export const DANH_SACH_MENU: MucMenu[] = [
  {
    ten: "Trang chính",
    duongDan: "/trang-chu",
    icon: LayoutDashboard,
  },
  {
    ten: "Bộ phận",
    duongDan: "/bo-phan",
    icon: Building2,
    quyen: QUYEN.BO_PHAN_XEM,
  },
  {
    ten: "Người dùng",
    duongDan: "/nguoi-dung",
    icon: Users,
    quyen: QUYEN.NGUOI_DUNG_XEM,
  },
  {
    ten: "Vai trò và quyền",
    duongDan: "/vai-tro",
    icon: ShieldCheck,
    chiAdmin: true,
  },
];