import {z} from "zod";

export const emailSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, { message: "Vui lòng nhập địa chỉ email." })
        .email({ message: "Địa chỉ email không đúng định dạng." }),
})

export const passwordSchema = z.object({
    password: z.string().trim().min(1, {message: "Vui lòng nhập mật khẩu."})
})

export type EmailValue = z.infer<typeof emailSchema>
export type PasswordValue = z.infer<typeof passwordSchema>

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Vui lòng nhập email." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});