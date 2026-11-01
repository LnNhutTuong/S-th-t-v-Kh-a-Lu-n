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
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  EmailStepValues,
  OtpStepValues,
  emailStepSchema,
  otpStepSchema,
} from "@/features/auth/schema/passwordless.schema";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import GoogleIcon from "@/assets/companyIcon";
import { useAuth } from "@/hook/auth";

export function LoginPage() {

  const {sendCode, verifyOtp} = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [targetEmail, setTargetEmail] = useState("");
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
      try {
        await sendCode(values.email);
        setTargetEmail(values.email.trim().toLowerCase());
        setStep("otp");
        setCountdown(60);
        otpForm.reset({ code: "" });
      }
      catch{
        throw new Error("Không thể gửi mã xác nhận. Vui lòng kiểm tra lại")
      }
    }


  // Xử lý xác thực mã OTP (Passwordless Verify)
  async function handleVerifyOtp(values: OtpStepValues) {
    try {
      await verifyOtp({ 
        email:targetEmail,
        code:values.code,
      })
    } catch{
      throw new Error("Không thể xác minh mã lúc này. Vui lòng thử lại sau.")
    }
  }

  // Gửi lại mã xác minh
  async function handleResendCode() {
    if (countdown > 0 || isResending || !targetEmail) return;

    setIsResending(true);

    try {
      await handleSendCode({email:targetEmail});
      setCountdown(60);
    } catch{
      throw new Error("Không thể gửi lại mã xác minh. Vui lòng thử lại sau.")
    } finally {
      setIsResending(false);
    }
  }

  // Quay lại bước nhập email
  function handleBackToEmail() {
    setStep("email");
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-slate-50 via-slate-100/70 to-blue-50/40 p-4 sm:p-6 lg:p-8 relative selection:bg-[#003B5C] selection:text-white ">
      {/* Nền trang trí gradient mờ nhẹ phía sau tạo chiều sâu */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-b from-[#003B5C]/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Thanh điều hướng trên cùng */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#003B5C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C] rounded px-2 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Quay về trang chủ</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200/80 shadow-2xs px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-[#003B5C]" />
          <span>Cổng nội bộ</span>
        </span>
      </header>

      {/* Thẻ đăng nhập chính căn giữa */}
      <main className="w-full max-w-md mx-auto my-auto py-2">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 backdrop-blur-xs">
          {/* Logo & Nhận diện Trường */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#003B5C] text-white font-bold text-xl flex items-center justify-center shadow-md shadow-[#003B5C]/20 border border-white/20 tracking-wider mb-3">
              AGU
            </div>
            <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
              TRƯỜNG ĐẠI HỌC AN GIANG
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Đại học Quốc gia TP. Hồ Chí Minh
            </p>
          </div>

          {/* Tiêu đề & Giới thiệu form */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {step === "email" ? "Đăng nhập hệ thống" : "Nhập mã xác thực"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {step === "email"
                ? "Đăng nhập không cần mật khẩu. Vui lòng nhập email trường (@student.agu.edu.vn) để nhận mã xác minh."
                : "Nhập mã xác thực 6 chữ số (OTP) vừa được gửi đến hộp thư của bạn."}
            </p>
          </div>

          {/* Thông báo hỗ trợ tài khoản */}
          {showSupportNote && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl border border-blue-200 bg-blue-50/90 text-xs text-blue-900 flex items-start gap-2.5 shadow-2xs"
            >
              <Info className="w-4 h-4 text-[#003B5C] mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold block text-slate-900 mb-0.5">
                  Lưu ý khi đăng nhập:
                </span>
                Hệ thống chỉ chấp nhận địa chỉ email do Trường Đại học An Giang cấp
                (định dạng{" "}
                <span className="font-semibold text-[#003B5C]">
                  @student.agu.edu.vn
                </span>
                ). Vui lòng kiểm tra cả thư mục Hộp thư đến (Inbox) và Thư rác (Spam) để lấy mã xác thực.
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
          {/* {sendCodeError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 shadow-2xs animate-in fade-in duration-200"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
              <span className="leading-relaxed text-xs sm:text-sm">{apiError}</span>
            </div>
          )} */}

          {/* Hiển thị thông báo thành công */}
          {/* {apiSuccess && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 shadow-2xs animate-in fade-in duration-200"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <span className="leading-relaxed text-xs sm:text-sm">
                {apiSuccess}
              </span>
            </div>
          )} */}

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
                          className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/15 rounded-xl text-sm shadow-2xs transition-all"
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
                  className="h-11 w-full bg-[#003B5C] hover:bg-[#002D4A] active:bg-[#002237] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
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
                            className="pl-10 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-300 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/15 rounded-xl text-lg tracking-[0.35em] font-mono shadow-2xs transition-all text-center"
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
                    className="h-11 w-full bg-[#003B5C] hover:bg-[#002D4A] active:bg-[#002237] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
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
          <div className="mt-6">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* Nút đăng nhập Google */}
            <a
              href="/api/auth/login?connection=google-oauth2"
              className="group w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm shadow-2xs hover:shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C]/20"
            >
              <GoogleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              <span>Đăng nhập bằng tài khoản Google</span>
            </a>

            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Hỗ trợ tài khoản Google Workspace do Trường ĐH An Giang cấp
            </p>
          </div>

          {/* Hỗ trợ & Thông tin bổ sung */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 text-center space-y-2">
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
          </div>
        </div>
      </main>

      {/* Footer bản quyền phía dưới chân trang */}
      {/* <footer className="w-full max-w-md mx-auto text-center py-4">
        <p className="text-xs text-slate-400">
          &copy; {currentYear} Trường Đại học An Giang &bull; ĐHQG-HCM
        </p>
        <p className="text-[11px] text-slate-400/80 mt-0.5">
          Hệ thống Quản trị công việc (TaskMenT)
        </p>
      </footer> */}
    </div>
  );
}