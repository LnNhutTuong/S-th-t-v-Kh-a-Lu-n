"use client"

import { ThemThanhVienForm, themThanhVienSchema } from "@/features/boPhan/schema/them-thanh-vien.schema";
import { ungVienType } from "@/features/boPhan/type/boPhan.type";
import { useThemThanhVien, useUngVien, useVaiTroCoTheGan } from "@/hooks/use-bo-phan";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {Loader2} from "lucide-react";

type Props = {boPhanId: string, open: boolean; onOpenChange: (open: boolean) => void}

export default function DialogThemThanhVien({boPhanId, open, onOpenChange}: Props){

    //định nghĩa input from cần thiết
    const {register, handleSubmit, setValue, reset, formState: {errors}} = useForm<ThemThanhVienForm>({
        resolver: zodResolver(themThanhVienSchema),
        defaultValues: {nguoiDungId: "", vaiTroId: ""}
    })

    const [tuKhoa, setTuKhoa] = useState("");
    const [nguoiDaChon, setNguoiDaChon] = useState<ungVienType | null>(null);
    const tuKhoaTre = useDebounce(tuKhoa, 300);

    const {data: dsVaiTro, isLoading: dangTaiVaiTro, isError: loiTaiVaiTro} = useVaiTroCoTheGan(boPhanId, open);
    const {data: dsUngVien, isLoading: dangTaiUngVien, isError: loiTaiUngVien} = useUngVien(boPhanId, tuKhoaTre);
    const {mutate, isPending} = useThemThanhVien(boPhanId);

    const dongDialog = () => {
        reset({nguoiDungId: "", vaiTroId: ""});
        setTuKhoa("");
        setNguoiDaChon(null);
        onOpenChange(false);
    }

    const xuLyMoDialog = (giaTri: boolean) => {
        if (!giaTri) {
            reset({nguoiDungId: "", vaiTroId: ""});
            setTuKhoa("");
            setNguoiDaChon(null);
        }
        onOpenChange(giaTri);
    }

    const onSubmit = (duLieu: ThemThanhVienForm) => {
        mutate(duLieu, { onSuccess: dongDialog });
    }

    return(
        <Dialog open={open} onOpenChange={xuLyMoDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm thành viên</DialogTitle>
                    <DialogDescription>Chọn người dùng và vai trò trong bộ phận.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="nguoiDung">Người dùng</FieldLabel>
                            {nguoiDaChon ? (
                                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                    <div className="min-w-0">
                                        <p className="truncate text-foreground">{nguoiDaChon.ten}</p>
                                        <p className="truncate text-xs text-muted-foreground">{nguoiDaChon.email}</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => {
                                        setNguoiDaChon(null);
                                        setValue("nguoiDungId", "", { shouldValidate: true });
                                    }}>Đổi</Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        id="nguoiDung"
                                        className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                                        value={tuKhoa}
                                        onChange={(event) => setTuKhoa(event.target.value)}
                                        placeholder="Tìm theo tên hoặc email"
                                        autoComplete="off"
                                    />
                                    {tuKhoa.trim().length >= 2 && (
                                        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-background shadow-md">
                                            {dangTaiUngVien || tuKhoa !== tuKhoaTre ? (
                                                <div className="space-y-2 p-3">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                </div>
                                            ) : loiTaiUngVien ? (
                                                <p className="p-3 text-sm text-destructive">Không thể tải danh sách người dùng.</p>
                                            ) : dsUngVien?.length ? (
                                                dsUngVien.map((ungVien) => (
                                                    <button
                                                        key={ungVien.id}
                                                        type="button"
                                                        className="flex w-full flex-col gap-1 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        onClick={() => {
                                                            setNguoiDaChon(ungVien);
                                                            setValue("nguoiDungId", ungVien.id, { shouldValidate: true });
                                                        }}
                                                    >
                                                        <span className="text-sm text-foreground">{ungVien.ten}</span>
                                                        <span className="text-xs text-muted-foreground">{ungVien.email}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="p-3 text-sm text-muted-foreground">Không tìm thấy người dùng phù hợp.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <FieldError errors={[errors.nguoiDungId]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="vaiTroId">Vai trò</FieldLabel>
                            <Select id="vaiTroId" className="border-input bg-background text-foreground w-full" defaultValue="" {...register("vaiTroId")}>
                                <option value="" disabled>Chọn vai trò</option>
                                {dangTaiVaiTro ? (
                                    <option value="" disabled>Đang tải vai trò...</option>
                                ) : loiTaiVaiTro ? (
                                    <option value="" disabled>Không thể tải danh sách vai trò</option>
                                ) : dsVaiTro?.map((vaiTro) => (
                                    <option key={vaiTro.id} value={vaiTro.id}>{vaiTro.ten}</option>
                                ))}
                            </Select>
                            <FieldError errors={[errors.vaiTroId]} />
                        </Field>
                    </FieldGroup>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={dongDialog}>Hủy</Button>
                        <Button type="submit" disabled={isPending}>Thêm {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
