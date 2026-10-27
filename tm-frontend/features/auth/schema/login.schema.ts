import { z } from "zod";

export const loginSchema = z.object({
username: z.string().min(1, { message: "Vui lòng nhập tài khoản." }),
password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
remember: z.boolean().optional(),
});
