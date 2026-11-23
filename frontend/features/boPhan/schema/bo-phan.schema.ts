import z  from "zod";
import { LoaiBoPhan, LoaiBpCanChonNhom } from "../type/boPhan.type";

export const boPhanSchema = z.object({
    ma: z.string().trim().min(3, "Mã tối thiểu 3 ký tự").max(30, "Mã tối đa 30 ký tự").regex(/^[a-zA-Z0-9_-]+$/, "Mã chỉ gồm chữ, số, - và _"),
    ten: z.string().trim().min(3, "Tên tối thiểu 3 ký tự").max(200, "Tên tối đa 200 ký tự"),
    loai: z.string().min(1, "Vui lòng chọn loại bộ phận"),
    boPhanChaId: z.string(),
    nhom: z.string()
}).superRefine((giaTri, ctx) => { //pass hết cái đống trên thì mới tới dưới này
    if(giaTri.loai !== LoaiBoPhan.BAN_GIAM_HIEU && !giaTri.boPhanChaId){
        ctx.addIssue({
            code: "custom",
            message: "Vui lòng chọn bộ phận cha",
            path: ["boPhanChaId"]
        })
    }

    if(LoaiBpCanChonNhom.includes(giaTri.loai as LoaiBoPhan) && !giaTri.nhom){
        ctx.addIssue({
            code: "custom",
            message: "Vui lòng chọn nhóm bộ phận",
            path: ["nhom"]
        })        
    }
})

export type boPhanForm = z.infer<typeof boPhanSchema>;