"use client";
import { useAuth } from "@/hook/auth";

export default function DashboardPage() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Xin chào, {user?.email}!</h1>
      <button
        onClick={() => logout()}
        disabled={isLoggingOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
      </button>
    </div>
  );
}
