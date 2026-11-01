"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailValue, PasswordValue, emailSchema, passwordSchema, loginSchema } from "@/features/admin/schema/admin-login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSupportNote, setShowSupportNote] = useState(false);

  const emailForm = useForm<EmailValue>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    }
  })

  const passwordForm = useForm<PasswordValue>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    }
  })

  const handleLogin = () =>{
    try {
      
    } catch (error) {
      console.error("Login error:", error);
    }
    
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#003B5C] p-4 sm:p-6 lg:p-8 relative selection:bg-[#003B5C] selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#003B5C]/20 to-transparent pointer-events-none blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#003B5C]/10 rounded-full pointer-events-none blur-3xl -z-10" />

      <header className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Quay về trang chủ</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 shadow-2xs px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Quản trị viên</span>
        </span>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-2">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#003B5C] text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-[#003B5C]/40 border border-white/10 tracking-wider mb-3">
              AGU
            </div>
            <h2 className="text-xs font-bold tracking-wider text-white/90 uppercase">
              TRƯỜNG ĐẠI HỌC AN GIANG
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Đại học Quốc gia TP. Hồ Chí Minh
            </p>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Đăng nhập quản trị
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Dành cho quản trị viên hệ thống TaskMenT. Vui lòng sử dụng tài khoản được cấp để đăng nhập.
            </p>
          </div>

          {showSupportNote && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-200 flex items-start gap-2.5 shadow-2xs"
            >
              <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold block text-white mb-0.5">
                  Lưu ý bảo mật:
                </span>
                Trang này chỉ dành cho quản trị viên được ủy quyền. Mọi hành vi truy cập trái phép sẽ được ghi nhận và xử lý theo quy định của Trường Đại học An Giang.
              </div>
              <button
                type="button"
                onClick={() => setShowSupportNote(false)}
                className="text-amber-300 hover:text-white p-0.5 -mr-1 -mt-1 rounded cursor-pointer transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-sm font-medium text-slate-300 flex items-center gap-1"
              >
                Email quản trị
                <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@agu.edu.vn"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/30 rounded-xl text-sm shadow-2xs transition-all"
                />
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-slate-300 flex items-center gap-1"
              >
                Mật khẩu
                <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/30 rounded-xl text-sm shadow-2xs transition-all"
                />
                <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-[#003B5C] hover:bg-[#004d77] active:bg-[#002D4A] text-white font-medium text-sm rounded-xl shadow-lg shadow-[#003B5C]/30 hover:shadow-[#003B5C]/50 transition-all focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Quên mật khẩu hoặc cần cấp quyền?{" "}
              <button
                type="button"
                onClick={() => setShowSupportNote((prev) => !prev)}
                className="font-medium text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                Liên hệ hỗ trợ
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md mx-auto text-center py-4">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Trường Đại học An Giang &bull; ĐHQG-HCM
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Hệ thống Quản trị công việc (TaskMenT) &mdash; Bảng điều khiển quản trị
        </p>
      </footer>
    </div>
  );
}
