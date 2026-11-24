import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TenCapBac, type thanhVienBoPhanType } from "@/features/boPhan/type/boPhan.type";
import { useCapNhatNgayKetThuc } from "@/hooks/use-bo-phan";
import { useState } from "react";

type Props = { boPhanId: string | null; thanhVien: thanhVienBoPhanType | null; onOpenChange: (open: boolean) => void };

export default function DialogKetThuc({ boPhanId, thanhVien, onOpenChange }: Props) {
    const [ngayKetThuc, setNgayKetThuc] = useState("");
    const { mutate, isPending } = useCapNhatNgayKetThuc(boPhanId);

    const homNay = new Date().toLocaleDateString("en-CA");
    const ngayThamGia = thanhVien?.ngayThamGia.slice(0, 10);
    const ngayHopLe = ngayKetThuc === "" || (ngayKetThuc >= (ngayThamGia ?? "") && ngayKetThuc <= homNay);

    const onSubmit = () => {
        if (!thanhVien || !ngayHopLe) return;

        const body = ngayKetThuc ? { ngayKetThuc } : {};
        mutate({ nguoiDungId: thanhVien.nguoiDung.id, body }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    return (
        <Dialog open={!!thanhVien} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kết thúc tham gia</DialogTitle>
                    <DialogDescription>
                        Kết thúc việc tham gia của <span className="font-bold text-black">{thanhVien?.nguoiDung.ten}</span> ? 
                        Hệ thống chỉ <span className="underline font-bold">đánh dấu</span> ngày kết thúc, <span className="underline font-bold">không xóa dòng</span>.
                    </DialogDescription>
                </DialogHeader>

                {thanhVien && thanhVien.capBac !== "THANH_VIEN" && (
                    <p className="text-sm text-amber-600">
                        Đây là {TenCapBac[thanhVien.capBac]} ({thanhVien.vaiTro.ten}), bộ phận sẽ thiếu {TenCapBac[thanhVien.capBac]} sau khi kết thúc.
                    </p>
                )}

                <Field>
                    <FieldLabel htmlFor="ngayKetThuc">Ngày kết thúc (để trống là hôm nay)</FieldLabel>
                    <Input
                        id="ngayKetThuc"
                        type="date"
                        className="border-input bg-background text-foreground"
                        value={ngayKetThuc}
                        min={ngayThamGia}
                        max={homNay}
                        aria-invalid={!ngayHopLe}
                        onChange={(event) => setNgayKetThuc(event.target.value)}
                    />
                    {!ngayHopLe && (
                        <p className="text-sm text-destructive">Ngày kết thúc phải nằm từ ngày tham gia đến hôm nay.</p>
                    )}
                </Field>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button type="button" variant="destructive" disabled={isPending || !ngayHopLe} onClick={onSubmit}>
                        {isPending ? "Đang xử lý..." : "Xác nhận"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
