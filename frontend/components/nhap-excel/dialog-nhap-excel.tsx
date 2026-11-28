"use client";

import { LoaiNhapExcel, PhienNhapExcelType } from "@/features/nhap-excel/type/nhap-excel.type";
import { useDuyetPhienExcel, useHuyPhienExcel, useXemTruocExcel } from "@/hooks/use-nhap-excel";
import { useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { loai: LoaiNhapExcel, open: boolean, onOpenChange: (open: boolean) => void }
type GiaTriCot = { khoa: string, ten: string }

const tenLoaiNhap: Record<LoaiNhapExcel, string> = {
    [LoaiNhapExcel.BO_PHAN]: "bộ phận",
    [LoaiNhapExcel.NGUOI_DUNG]: "người dùng",
    [LoaiNhapExcel.NHIEM_VU]: "nhiệm vụ",
    [LoaiNhapExcel.DE_TAI]: "đề tài",
}

const dinhDangDungLuong = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const hienThiGiaTri = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export default function DialogNhapExcel({ loai, open, onOpenChange }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [phien, setPhien] = useState<PhienNhapExcelType | null>(null);
    const [dangKeoTha, setDangKeoTha] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const xemTruoc = useXemTruocExcel();
    const duyet = useDuyetPhienExcel();
    const huy = useHuyPhienExcel();

    const dong = () => {
        setFile(null);
        setPhien(null);
        xemTruoc.reset();
        onOpenChange(false);
    }

    const dongDialog = () => {
        if (huy.isPending || duyet.isPending) return;
        if (phien) {
            huy.mutate(phien.id, { onSuccess: dong });
            return;
        }
        dong();
    }

    const chonFile = (selected: File | null) => {
        if (!selected) return;
        setFile(selected);
        setPhien(null);
        xemTruoc.reset();
    }

    const handleXemTruoc = () => {
        if (!file) return;
        xemTruoc.mutate({ loai, file }, { onSuccess: (result) => setPhien(result as PhienNhapExcelType) });
    };

    const handleDuyet = (id: string) => {
        duyet.mutate(id, { onSuccess: dong });
    };

    const danhSachLoi = phien?.loi ?? [];
    const cacCot: GiaTriCot[] = phien
        ? Array.from(new Set(phien.duLieuXemTruoc.flatMap((dongDuLieu) => Object.keys(dongDuLieu.giaTri))))
            .map((khoa) => ({ khoa, ten: khoa }))
        : [];
    const cacCotSuyRa: GiaTriCot[] = phien
        ? Array.from(new Set(phien.duLieuXemTruoc.flatMap((dongDuLieu) => Object.keys(dongDuLieu.suyRa ?? {}))))
            .map((khoa) => ({ khoa, ten: `Suy ra: ${khoa}` }))
        : [];
    const coLoi = danhSachLoi.length > 0;
    const coTheDuyet = !!phien && !coLoi && phien.duLieuXemTruoc.length > 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) dongDialog(); }}>
            <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:p-0">
                <DialogHeader className="mb-0 shrink-0 border-b px-6 py-4 pr-14">
                    <DialogTitle>Thêm {tenLoaiNhap[loai]} từ tệp Excel</DialogTitle>
                    <DialogDescription>Tải biểu mẫu, chọn tệp Excel và kiểm tra dữ liệu trước khi duyệt nhập.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 overflow-y-auto px-6 py-5">
                    <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
                        <div>
                            <h3 className="text-sm font-medium">Chuẩn bị dữ liệu</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Tải biểu mẫu đúng loại dữ liệu để nhập.</p>
                        </div>
                        <a href={`/api/nhap-excel/mau/${loai}`} download className={buttonVariants({ variant: "outline" })}>
                            Tải mẫu Excel
                        </a>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-medium">Chọn tệp dữ liệu</h3>
                        <div
                            onDragOver={(event) => { event.preventDefault(); setDangKeoTha(true); }}
                            onDragLeave={() => setDangKeoTha(false)}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDangKeoTha(false);
                                chonFile(event.dataTransfer.files[0] ?? null);
                            }}
                            className={`rounded-lg border border-dashed px-5 py-7 text-center ${dangKeoTha ? "border-primary bg-muted" : "border-border bg-muted/20"}`}
                        >
                            <p className="text-sm">Kéo thả tệp Excel vào đây</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                hoặc{" "}
                                <button type="button" className="font-medium text-primary underline underline-offset-4" onClick={() => inputRef.current?.click()}>
                                    mở thư mục để chọn tệp
                                </button>
                            </p>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="sr-only"
                                onChange={(event) => chonFile(event.target.files?.[0] ?? null)}
                                aria-label="Chọn tệp Excel"
                            />
                        </div>
                        {file && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                                <span className="min-w-0 break-all font-medium">{file.name}</span>
                                <span className="text-muted-foreground">{dinhDangDungLuong(file.size)}</span>
                            </div>
                        )}
                    </section>

                    <section className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-medium">Kết quả kiểm tra</h3>
                            <Button type="button" variant="outline" onClick={handleXemTruoc} disabled={!file || xemTruoc.isPending}>
                                {xemTruoc.isPending ? "Đang kiểm tra..." : phien ? "Kiểm tra lại" : "Kiểm tra"}
                            </Button>
                        </div>

                        {xemTruoc.isError && (
                            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                <span>Không thể kiểm tra tệp. Vui lòng thử lại.</span>
                                <Button type="button" size="sm" variant="outline" onClick={handleXemTruoc} disabled={!file || xemTruoc.isPending}>Thử lại</Button>
                            </div>
                        )}

                        {xemTruoc.isPending && (
                            <div className="space-y-2" aria-label="Đang tải kết quả kiểm tra">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        )}

                        {!xemTruoc.isPending && phien && (
                            <>
                                <div className={`rounded-md border px-4 py-3 text-sm ${coLoi ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
                                    <p className="font-medium">{coLoi ? `Kiểm tra phát hiện ${phien.tomTat.soLoi} lỗi` : `Kiểm tra đạt yêu cầu: ${phien.tomTat.tongDong} dòng dữ liệu hợp lệ`}</p>
                                    <p className="mt-1 text-muted-foreground">Tạo mới: {phien.tomTat.soTaoMoi} · Cập nhật: {phien.tomTat.soCapNhat}</p>
                                </div>
                                <div className="max-h-80 overflow-auto rounded-md border">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-muted">
                                            <TableRow>
                                                <TableHead>Dòng</TableHead>
                                                {cacCot.map((cot) => <TableHead key={cot.khoa}>{cot.ten}</TableHead>)}
                                                {cacCotSuyRa.map((cot) => <TableHead key={`suy-ra-${cot.khoa}`}>{cot.ten}</TableHead>)}
                                                <TableHead>Lỗi kiểm tra</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {phien.duLieuXemTruoc.map((dongDuLieu) => {
                                                const loiDong = danhSachLoi.filter((loi) => loi.dong === dongDuLieu.dong);
                                                return (
                                                    <TableRow key={dongDuLieu.dong}>
                                                        <TableCell>{dongDuLieu.dong}</TableCell>
                                                        {cacCot.map((cot) => <TableCell key={cot.khoa}>{hienThiGiaTri(dongDuLieu.giaTri[cot.khoa])}</TableCell>)}
                                                        {cacCotSuyRa.map((cot) => <TableCell key={`suy-ra-${cot.khoa}`}>{hienThiGiaTri(dongDuLieu.suyRa?.[cot.khoa])}</TableCell>)}
                                                        <TableCell className={loiDong.length ? "min-w-64 whitespace-normal text-destructive" : "text-muted-foreground"}>
                                                            {loiDong.length ? loiDong.map((loi, index) => (
                                                                <p key={`${loi.dong}-${loi.cot}-${index}`}>{loi.cot}: {loi.thongBao}</p>
                                                            )) : "Đạt"}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {phien.duLieuXemTruoc.length === 0 && (
                                                <TableRow><TableCell colSpan={cacCot.length + cacCotSuyRa.length + 2} className="h-20 text-center text-muted-foreground">Không có dòng dữ liệu xem trước.</TableCell></TableRow>
                                            )}
                                            {danhSachLoi.filter((loi) => !phien.duLieuXemTruoc.some((dongDuLieu) => dongDuLieu.dong === loi.dong)).map((loi, index) => (
                                                <TableRow key={`loi-${loi.dong}-${loi.cot}-${index}`}>
                                                    <TableCell>{loi.dong}</TableCell>
                                                    <TableCell colSpan={cacCot.length + cacCotSuyRa.length}>{loi.cot}</TableCell>
                                                    <TableCell className="min-w-64 whitespace-normal text-destructive">{loi.thongBao}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}

                        {!xemTruoc.isPending && !phien && !xemTruoc.isError && (
                            <p className="rounded-md border px-4 py-6 text-center text-sm text-muted-foreground">Chưa có kết quả kiểm tra.</p>
                        )}
                    </section>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-6 py-4">
                    <p className="text-sm text-muted-foreground">{coTheDuyet ? "Tệp đã sẵn sàng để duyệt nhập." : "Kiểm tra tệp trước khi duyệt nhập."}</p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={dongDialog} disabled={huy.isPending || duyet.isPending}>
                            {huy.isPending ? "Đang hủy phiên..." : "Đóng"}
                        </Button>
                        <Button type="button" onClick={() => phien && handleDuyet(phien.id)} disabled={!coTheDuyet || duyet.isPending || huy.isPending}>
                            {duyet.isPending ? "Đang duyệt..." : "Duyệt nhập"}
                        </Button>
                    </div>
                    </div>
            </DialogContent>
        </Dialog>
    );
}
