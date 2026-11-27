import { themThanhVienSchema } from "./them-thanh-vien.schema";
import z from "zod";

//Them thanh vien co thi lay ra xai, ko can viet lai
export const ketThucSchema = themThanhVienSchema.pick({vaiTroId: true});

export type ketThucType = z.infer<typeof ketThucSchema>;