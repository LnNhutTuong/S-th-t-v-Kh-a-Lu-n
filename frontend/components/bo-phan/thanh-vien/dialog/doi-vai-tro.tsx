import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { doiVaiTroSchema, type doiVaiTroType } from "@/features/boPhan/schema/doi-vai-tro.schema";
import type { thanhVienBoPhanType } from "@/features/boPhan/type/boPhan.type";
import { useSuaThanhVien, useVaiTroCoTheGan } from "@/hooks/use-bo-phan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = { boPhanId: string | null; thanhVien: thanhVienBoPhanType | null; onOpenChange: (open: boolean) => void };

export default function DialogDoiVaiTro({ boPhanId, thanhVien, onOpenChange }: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<doiVaiTroType>({
        resolver: zodResolver(doiVaiTroSchema),
        defaultValues: { vaiTroId: thanhVien?.vaiTro.id ?? "" },
        values: { vaiTroId: thanhVien?.vaiTro.id ?? "" }
    });

    const { data: dsVaiTro, isLoading, isError } = useVaiTroCoTheGan(boPhanId, !!thanhVien);
    const { mutate, isPending } = useSuaThanhVien(boPhanId);

    const onSubmit = ({ vaiTroId }: doiVaiTroType) => {
        if (!thanhVien) return;

        if (vaiTroId === thanhVien.vaiTro.id) {
            onOpenChange(false);
            return;
        }

        mutate({ nguoiDungId: thanhVien.nguoiDung.id, body: { vaiTroId } }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    return (
        <Dialog open={!!thanhVien} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Đổi vai trò</DialogTitle>
                    <DialogDescription>Đổi vai trò của <span className="font-bold text-black">{thanhVien?.nguoiDung.ten}</span> </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="vaiTroId">Vai trò</FieldLabel>
                            {isLoading ? (
                                <Skeleton className="h-9 w-full" />
                            ) : isError ? (
                                <p className="text-sm text-destructive">Không thể tải danh sách vai trò.</p>
                            ) : (
                                <Select id="vaiTroId" className="w-full border-input bg-background text-foreground" defaultValue={thanhVien?.vaiTro.id} {...register("vaiTroId")}>
                                    {dsVaiTro?.length ? dsVaiTro.map((vaiTro) => (
                                        <option key={vaiTro.id} value={vaiTro.id}>
                                            {vaiTro.ten}{vaiTro.id === thanhVien?.vaiTro.id ? " (hiện tại)" : ""}
                                        </option>
                                    )) : <option value="" disabled>Không có vai trò khả dụng.</option>}
                                </Select>
                            )}
                            <FieldError errors={[errors.vaiTroId]} />
                        </Field>
                    </FieldGroup>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
