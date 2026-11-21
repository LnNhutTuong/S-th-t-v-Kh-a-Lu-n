"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { DANH_SACH_MENU } from "@/constants/menu";
import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";

export function AppSidebar() {

  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const {coQuyen ,isLoading, laAdmin} = usePermission();

  // Mục đang đứng: đúng đường dẫn, hoặc là trang con (ví dụ /bo-phan/abc thuộc mục /bo-phan)
  const dangDung = (duongDan: string) =>
    pathname === duongDan || pathname.startsWith(`${duongDan}/`);

  // Lọc menu theo quyền
  const menuLoc = DANH_SACH_MENU.filter((muc) => {
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
      <Sidebar collapsible="icon">
        {/* Logo */}
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003B5C] text-sx font-bold tracking-wider text-white">
              AGU
            </div>
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <p className="truncate text-md font-bold text-slate-900">
                TaskMenT
              </p>
              <p className="truncate text-[12px] text-slate-500">
                Trường Đại học An Giang
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* Danh sách menu theo quyền */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuSkeleton />
              ) : ( 
                menuLoc.map((muc) => {
                  const Icon = muc.icon;

                  return (
                    <SidebarMenuItem key={muc.duongDan}>
                      <SidebarMenuButton
                        asChild
                        isActive={dangDung(muc.duongDan)}
                        tooltip={muc.ten}
                      >
                        <Link href={muc.duongDan}>
                          <Icon />
                          <span>{muc.ten}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }) 
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Người dùng và đăng xuất */}
        <SidebarFooter>
          <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.ten}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Đăng xuất"
                disabled={isLoggingOut}
                onClick={() => logout()}
                className="cursor-pointer"
              >
                <LogOut />
                <span>
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  );
}