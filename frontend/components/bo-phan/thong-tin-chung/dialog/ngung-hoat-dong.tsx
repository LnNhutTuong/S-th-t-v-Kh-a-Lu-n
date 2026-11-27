"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { boPhanType } from "@/features/bo-phan/type/boPhan.type";
import { useCapNhatTrangThai } from "@/hooks/use-bo-phan";

type Props = { boPhan: boPhanType | null; onOpenChange: (open: boolean) => void }

export default function DialogNgungHoatDong({ boPhan, onOpenChange }: Props) {

    const { mutate, isPending } = useCapNhatTrangThai(boPhan?.id || null);
    const dangNgung = !!boPhan?.ngungHoatDong;

    const onSubmit = () => {
        if(!boPhan) return;

        mutate({
            ngungHoatDong: !boPhan.ngungHoatDong
        }, {onSuccess: () => onOpenChange(false)})
    }

    return (
        <Dialog open={!!boPhan} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dangNgung ? "Kích hoạt lại bộ phận" : "Ngừng hoạt động bộ phận"}</DialogTitle>
                    <DialogDescription>
                        {dangNgung ? (
                            <span>Bộ phận sẽ hiện lại trên cây.</span>
                        ) : (
                            <span>
                                Bộ phận sẽ biến khỏi cây <span className="italic">(bật &quot;Bao gồm ngừng HĐ&quot; để xem lại)</span>, không chọn được làm bộ phận cha và dữ liệu không bị xóa.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button type="button" variant={dangNgung ? "default" : "destructive"} disabled={isPending} onClick={onSubmit}>
                        {isPending ? "Đang xử lý..." : dangNgung ? "Kích hoạt lại" : "Ngừng hoạt động"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
