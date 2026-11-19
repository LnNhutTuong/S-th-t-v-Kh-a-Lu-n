import { z } from "zod";
import { OTP_REGEX } from "@/constants/regex";

export const emailStepSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email." })
    .email({ message: "Địa chỉ email không đúng định dạng." })
});

export const otpStepSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập mã xác thực." })
    .length(6, { message: "Mã xác thực gồm đúng 6 chữ số." })
    .regex(/^\d{6}$/, { message: "Mã xác minh chỉ bao gồm các chữ số." }),
});

export type EmailStepValues = z.infer<typeof emailStepSchema>;
export type OtpStepValues = z.infer<typeof otpStepSchema>;

// Schema validate payload gửi lên BE /auth/passwordless-login
export const passwordlessLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { message: "Email không được để trống." })
    .email({ message: "Email không đúng định dạng." })
});

// Schema validate request verify OTP (dùng trong API route)
export const verifyOtpRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(254)
    .email(),
  code: z
    .string()
    .trim()
    .length(6)
    .regex(OTP_REGEX),
});

// Infer types từ schema
export type PasswordlessLoginPayload = z.infer<typeof passwordlessLoginSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
