import z from "zod" 
//dựa trên body gửi về BE
export const themThanhVienSchema = z.object({
     nguoiDungId: z.string().min(1, "Vui lòng chọn người dùng"), 
     vaiTroId: z.string().min(1, "Vui lòng chọn vai trò") 
})

//chuyển hóa type từ zod
export type ThemThanhVienForm = z.infer<typeof themThanhVienSchema>;