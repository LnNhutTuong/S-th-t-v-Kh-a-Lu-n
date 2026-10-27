"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff, Loader2, UserRound } from "lucide-react";
login
import { loginSchema } from "@/features/auth/schema/login.schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const { isSubmitting, errors } = form.formState;

  async function onSubmit(values: LoginValues) {
    // TODO: thay bằng hook useLogin() (TanStack Query) ở bước tiếp theo
    console.log(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {/* Lỗi chung từ server (dùng form.setError("root", ...)) */}
        {errors.root && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <span className="leading-relaxed">{errors.root.message}</span>
          </div>
        )}

        {/* Username */}
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username">Email hoặc tên đăng nhập</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="username"
                  type="text"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  autoComplete="username"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  className="pl-10"
                />
                <UserRound className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Link
                  href="#"
                  tabIndex={-1}
                  className="text-sm font-medium text-[#003B5C] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-2.5 text-slate-400 transition-colors hover:text-slate-600 focus:text-slate-600 focus:outline-none disabled:opacity-50"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Remember me: Checkbox không dùng được register(), phải qua Controller */}
        <Controller
          name="remember"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={isSubmitting}
              />
              <FieldLabel
                htmlFor="remember"
                className="cursor-pointer select-none font-normal text-slate-600"
              >
                Ghi nhớ đăng nhập
              </FieldLabel>
            </Field>
          )}
        />

        <Button type="submit" className="h-11 w-full text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}