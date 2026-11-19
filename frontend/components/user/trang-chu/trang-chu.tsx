"use client";

import { AppSidebar } from "../app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hook/auth";
import { usePermission } from "@/hook/permission";
import { DANH_SACH_MENU } from "@/constants/menu";

export default function TrangChu() {

  const { user, logout, isLoggingOut } = useAuth();

  const { coQuyen, laAdmin } = usePermission();

  // Lọc menu theo quyền
  const dsMenu = DANH_SACH_MENU.filter((muc) => {
    // Chỉ ADMIN
    if (muc.chiAdmin){
      return laAdmin;
    } 

    // Có quyền tương ứng
    if (muc.quyen){
      return coQuyen(muc.quyen);
    } 

    // Không yêu cầu quyền
    return true;
  });

  return (
    
    <>
      <div className="flex gap-10">
        <SidebarProvider className="w-fit" >
          <AppSidebar />
        </SidebarProvider>
        {dsMenu && dsMenu.length <= 1 ?
        <div className=" w-full flex flex-col justify-center items-center rounded-xl border">
          <h1 className="text-xl font-bold">Xin chào, {user?.ten}!</h1>
          <p>Tài khoản của bạn đang chờ <span className="underline decoration-red-500">quản trị viên gán bộ phận</span> </p>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>: <></>
        }
      </div> 
    </> 
  )
}