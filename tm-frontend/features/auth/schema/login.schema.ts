import { z } from "zod";

const AGU_EMAIL_REGEX = /^[^\s@]+@student.agu\.edu\.vn$/i;

export const emailStepSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Vui lòng nhập địa chỉ email." })
    .email({ message: "Địa chỉ email không đúng định dạng." })
    .regex(AGU_EMAIL_REGEX, {
      message: "Vui lòng sử dụng email đuôi @student.agu.edu.vn của trường.",
    }),
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

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Vui lòng nhập tài khoản." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
  remember: z.boolean().optional(),
});

