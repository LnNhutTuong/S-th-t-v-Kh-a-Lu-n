"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  EmailStepValues,
  OtpStepValues,
  emailStepSchema,
  otpStepSchema,
} from "@/features/auth/schema/login.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [targetEmail, setTargetEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showSupportNote, setShowSupportNote] = useState(false);

  // Form bước 1: Nhập email trường
  const emailForm = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: { email: "" },
  });

  // Form bước 2: Nhập OTP
  const otpForm = useForm<OtpStepValues>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { code: "" },
  });

  // Bộ đếm lùi thời gian cho phép gửi lại mã OTP (60s)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Xử lý gửi mã xác nhận (Passwordless Start)
  async function handleSendCode(values: EmailStepValues) {
    setApiError(null);
    setApiSuccess(null);

    try {
      const response = await fetch("/api/auth/passwordless/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setApiError(data.message || "Không thể gửi mã xác nhận. Vui lòng kiểm tra lại email.");
        return;
      }

      setTargetEmail(values.email.trim().toLowerCase());
      setStep("otp");
      setCountdown(60);
      setApiSuccess(data.message || "Mã xác thực 6 chữ số đã được gửi đến hộp thư của bạn.");
      otpForm.reset({ code: "" });
    } catch {
      setApiError("Đã xảy ra sự cố kết nối máy chủ. Vui lòng thử lại sau.");
    }
  }

  // Xử lý xác thực mã OTP (Passwordless Verify)
  async function handleVerifyOtp(values: OtpStepValues) {
    setApiError(null);
    setApiSuccess(null);

    try {
      const response = await fetch("/api/auth/passwordless/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          code: values.code,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setApiError(data.message || "Mã xác minh không đúng hoặc đã hết hạn.");
        return;
      }

      setApiSuccess("Xác thực thành công! Đang chuyển hướng vào hệ thống...");
      const redirectUrl = data.redirectTo || "/dashboard";
      setTimeout(() => {
        router.push(redirectUrl);
      }, 600);
    } catch {
      setApiError("Không thể xác minh mã lúc này. Vui lòng thử lại sau.");
    }
  }

  // Gửi lại mã xác minh
  async function handleResendCode() {
    if (countdown > 0 || isResending || !targetEmail) return;

    setIsResending(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const response = await fetch("/api/auth/passwordless/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setApiError(data.message || "Không thể gửi lại mã xác minh. Vui lòng thử lại.");
        return;
      }

      setCountdown(60);
      setApiSuccess("Đã gửi mã xác minh mới đến hộp thư của bạn.");
    } catch {
      setApiError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  }

  // Quay lại bước nhập email
  function handleBackToEmail() {
    setStep("email");
    setApiError(null);
    setApiSuccess(null);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-slate-50 overflow-y-auto selection:bg-[#003B5C] selection:text-white">
      {/* ========================================================= */}
      {/* KHU VỰC NHẬN DIỆN THƯƠNG HIỆU (BRAND PANEL)               */}
      {/* ========================================================= */}
      <div className="relative hidden lg:flex flex-col justify-between w-full lg:w-[48%] xl:w-[45%] bg-gradient-to-br from-[#00253E] via-[#003B5C] to-[#0A4E78] text-white p-10 xl:p-14 overflow-hidden select-none">
        {/* Phần đầu: Biểu trưng và tên trường */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-[#003B5C] font-bold text-xl flex items-center justify-center shadow-md tracking-wider border border-white/20 shrink-0">
              AGU
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
                TRƯỜNG ĐẠI HỌC AN GIANG
              </h2>
              <p className="text-[11px] text-blue-200/80 font-medium mt-0.5">
                Đại học Quốc gia TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* Tiêu đề & Giới thiệu hệ thống */}
          <div className="mt-14 xl:mt-20 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-100 text-xs font-medium backdrop-blur-xs mb-6 border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Cổng thông tin điều hành nội bộ</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-snug">
              Hệ thống <br />
              <span className="text-blue-100">Quản trị công việc</span>
            </h1>

            <p className="mt-4 text-blue-100/85 text-sm xl:text-base leading-relaxed">
              Không gian làm việc số hỗ trợ quản lý nhiệm vụ, theo dõi tiến độ và
              phối hợp công việc thông suốt trong toàn trường.
            </p>
          </div>

          {/* Các điểm nổi bật về phương thức xác thực và hệ thống */}
          <div className="mt-10 space-y-3.5 max-w-md">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-xs">
              <div className="p-1 rounded-md bg-white/15 text-blue-100 mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Đăng nhập Passwordless hiện đại
                </h3>
                <p className="text-[12px] text-blue-100/75 mt-0.5 leading-snug">
                  Đăng nhập nhanh chóng và bảo mật cao thông qua mã OTP gửi trực tiếp
                  về email trường @agu.edu.vn, không cần ghi nhớ mật khẩu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-xs">
              <div className="p-1 rounded-md bg-white/15 text-blue-100 mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Đồng bộ Google Workspace ĐH An Giang
                </h3>
                <p className="text-[12px] text-blue-100/75 mt-0.5 leading-snug">
                  Hỗ trợ đăng nhập một chạm với tài khoản Google nhà trường,
                  tối ưu trải nghiệm làm việc liền mạch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-xs">
              <div className="p-1 rounded-md bg-white/15 text-blue-100 mt-0.5 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Bảo mật & Phân quyền chuẩn xác
                </h3>
                <p className="text-[12px] text-blue-100/75 mt-0.5 leading-snug">
                  Bảo vệ dữ liệu công việc với chính sách bảo mật nội bộ và
                  phân quyền phân cấp rõ ràng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer khu vực nhận diện */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/70 font-medium">
          <span>&copy; {currentYear} Trường Đại học An Giang</span>
          <span className="flex items-center gap-1.5 text-blue-200/80">
            <ShieldCheck className="w-4 h-4 text-blue-200" />
            Hệ thống nội bộ
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KHU VỰC BIỂU MẪU ĐĂNG NHẬP (LOGIN FORM PANEL)              */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen lg:min-h-0 overflow-y-auto">
        {/* Nút quay về trang chủ */}
        <div className="w-full max-w-[420px] mx-auto flex items-center justify-between mb-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#003B5C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C] rounded px-1 py-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Quay về trang chủ</span>
          </Link>

          <span className="text-[11px] font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
            Xác thực nội bộ
          </span>
        </div>

        {/* Thân biểu mẫu đăng nhập */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          {/* Nhận diện trường trên Mobile */}
          <div className="lg:hidden flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-[#003B5C] text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0">
              AGU
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase leading-snug">
                TRƯỜNG ĐẠI HỌC AN GIANG
              </div>
              <div className="text-[11px] text-slate-500">
                Hệ thống Quản trị công việc
              </div>
            </div>
          </div>

          {/* Tiêu đề biểu mẫu */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              {step === "email" ? "Đăng nhập hệ thống" : "Nhập mã xác thực"}
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              {step === "email"
                ? "Đăng nhập không cần mật khẩu. Vui lòng nhập email trường (@agu.edu.vn) để nhận mã xác minh."
                : "Nhập mã xác thực 6 chữ số (OTP) vừa được gửi đến hộp thư của bạn."}
            </p>
          </div>

          {/* Thông báo hỗ trợ tài khoản */}
          {showSupportNote && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-lg border border-blue-200 bg-blue-50/90 text-xs text-blue-900 flex items-start gap-2.5 shadow-2xs"
            >
              <Info className="w-4 h-4 text-[#003B5C] mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold block text-slate-900 mb-0.5">
                  Lưu ý khi đăng nhập:
                </span>
                Hệ thống chỉ chấp nhận địa chỉ email cán bộ, giảng viên do Trường
                Đại học An Giang cấp (định dạng{" "}
                <span className="font-semibold text-[#003B5C]">
                  @agu.edu.vn
                </span>
                ). Vui lòng kiểm tra kỹ cả thư mục Hộp thư đến (Inbox) và Thư
                rác (Spam) để lấy mã xác thực.
              </div>
              <button
                type="button"
                onClick={() => setShowSupportNote(false)}
                className="text-blue-700 hover:text-blue-900 p-0.5 -mr-1 -mt-1 rounded cursor-pointer transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hiển thị thông báo lỗi chung */}
          {apiError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 shadow-2xs animate-in fade-in duration-200"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <span className="leading-relaxed text-xs sm:text-sm">{apiError}</span>
            </div>
          )}

          {/* Hiển thị thông báo thành công */}
          {apiSuccess && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 shadow-2xs animate-in fade-in duration-200"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <span className="leading-relaxed text-xs sm:text-sm">
                {apiSuccess}
              </span>
            </div>
          )}

          {/* ========================================================= */}
          {/* BƯỚC 1: NHẬP EMAIL (PASSWORDLESS START)                    */}
          {/* ========================================================= */}
          {step === "email" && (
            <form
              onSubmit={emailForm.handleSubmit(handleSendCode)}
              noValidate
              className="space-y-4"
            >
              <FieldGroup className="gap-4">
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="space-y-1.5"
                    >
                      <FieldLabel
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700 flex items-center gap-1"
                      >
                        Email sinh viên (@student.agu.edu.vn)
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="ví dụ: abc123456@student.agu.edu.vn"
                          autoComplete="email"
                          disabled={emailForm.formState.isSubmitting}
                          aria-invalid={fieldState.invalid}
                          className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/15 rounded-lg text-sm shadow-2xs transition-all"
                        />
                        <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  className="h-11 w-full bg-[#003B5C] hover:bg-[#002D4A] active:bg-[#002237] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang gửi mã...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp tục với mã xác minh</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          {/* ========================================================= */}
          {/* BƯỚC 2: NHẬP MÃ OTP (PASSWORDLESS VERIFY)                  */}
          {/* ========================================================= */}
          {step === "otp" && (
            <div className="space-y-4">
              {/* Thẻ hiển thị email đã gửi kèm nút thay đổi */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs">
                <div className="flex items-center gap-2 text-slate-700 min-w-0">
                  <Mail className="w-4 h-4 text-[#003B5C] shrink-0" />
                  <span className="truncate font-medium">{targetEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-[#003B5C] font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Đổi email
                </button>
              </div>

              <form
                onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                noValidate
                className="space-y-4"
              >
                <FieldGroup className="gap-4">
                  <Controller
                    name="code"
                    control={otpForm.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-1.5"
                      >
                        <FieldLabel
                          htmlFor="otp-code"
                          className="text-sm font-medium text-slate-700 flex items-center gap-1"
                        >
                          Mã xác thực (6 chữ số)
                          <span className="text-red-500" aria-hidden="true">
                            *
                          </span>
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="otp-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="123456"
                            disabled={otpForm.formState.isSubmitting}
                            aria-invalid={fieldState.invalid}
                            className="pl-10 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-300 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/15 rounded-lg text-lg tracking-[0.35em] font-mono shadow-2xs transition-all text-center"
                          />
                          <KeyRound className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={otpForm.formState.isSubmitting}
                    className="h-11 w-full bg-[#003B5C] hover:bg-[#002D4A] active:bg-[#002237] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {otpForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Xác nhận & Đăng nhập</span>
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>

              {/* Tùy chọn gửi lại mã OTP */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <div>
                  {countdown > 0 ? (
                    <span className="text-slate-400">
                      Gửi lại mã sau{" "}
                      <span className="font-semibold text-slate-600">
                        {countdown}s
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="inline-flex items-center gap-1 font-semibold text-[#003B5C] hover:text-[#002845] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isResending ? "animate-spin" : ""
                        }`}
                      />
                      <span>Gửi lại mã</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PHẦN ĐĂNG NHẬP GOOGLE PHÍA DƯỚI                           */}
          {/* ========================================================= */}
          <div className="mt-7">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-400 font-medium tracking-wider">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* Nút đăng nhập Google */}
            <a
              href="/api/auth/login?connection=google-oauth2"
              className="group w-full flex items-center justify-center gap-3 h-11 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm shadow-2xs hover:shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C]/20"
            >
              <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              <span>Đăng nhập bằng tài khoản Google</span>
            </a>

            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Hỗ trợ tài khoản Google Workspace do Trường ĐH An Giang cấp (@agu.edu.vn)
            </p>
          </div>

          {/* Hỗ trợ & Thông tin bổ sung */}
          <div className="mt-8 pt-5 border-t border-slate-200/80 text-center space-y-2.5">
            <p className="text-xs text-slate-500">
              Bạn cần hỗ trợ đăng nhập?{" "}
              <button
                type="button"
                onClick={() => setShowSupportNote((prev) => !prev)}
                className="font-medium text-[#003B5C] hover:underline cursor-pointer"
              >
                Hướng dẫn & Hỗ trợ
              </button>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Hệ thống dành riêng cho cán bộ, giảng viên ĐH An Giang</span>
            </div>
          </div>
        </div>

        {/* Footer cho Mobile */}
        <div className="lg:hidden text-center text-xs text-slate-400 py-3 mt-4">
          &copy; {currentYear} Trường Đại học An Giang
        </div>
      </div>
    </div>
  );
}