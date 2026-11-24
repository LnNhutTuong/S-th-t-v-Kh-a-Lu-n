'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TenCapBac, type thanhVienBoPhanType } from "@/features/boPhan/type/boPhan.type";
import { useDsThanhVien } from "@/hooks/use-bo-phan";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import DialogDoiVaiTro from "./dialog/doi-vai-tro";
import DialogThemThanhVien from "./dialog/them-thanh-vien";
import DialogKetThuc from "./dialog/ket-thuc";

type Props = { boPhanId: string | null };

function BangThanhVienSkeleton({ baoGomDaKetThuc }: { baoGomDaKetThuc: boolean }) {
  const soCot = baoGomDaKetThuc ? 6 : 5;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: soCot }, (_, index) => (
            <TableHead key={index}><Skeleton className="h-4 w-20" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: soCot }, (_, cellIndex) => (
              <TableCell key={cellIndex}><Skeleton className="h-4 w-24" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DongThanhVien({
  thanhVien,
  baoGomDaKetThuc,
  onDoiVaiTro,
  onKetThuc
}: {
  thanhVien: thanhVienBoPhanType;
  baoGomDaKetThuc: boolean;
  onDoiVaiTro: () => void;
  onKetThuc: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{thanhVien.nguoiDung.ten}</TableCell>
      <TableCell>{thanhVien.nguoiDung.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{thanhVien.vaiTro.ten}</span>
          {thanhVien.capBac !== "THANH_VIEN" && (
            <Badge variant="secondary">{TenCapBac[thanhVien.capBac]}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{new Date(thanhVien.ngayThamGia).toLocaleDateString("vi-VN")}</TableCell>
      {baoGomDaKetThuc && (
        <TableCell>
          {thanhVien.ngayKetThuc
            ? new Date(thanhVien.ngayKetThuc).toLocaleDateString("vi-VN")
            : "Đang làm"}
        </TableCell>
      )}
      <TableCell className="text-right">
        {thanhVien.ngayKetThuc ? "—" : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Thao tác" />}
            >
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDoiVaiTro}>
                Đổi vai trò
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onKetThuc}>
                Kết thúc 
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function BoPhanThanhVien({ boPhanId }: Props) {
  const [prevBoPhanId, setPrevBoPhanId] = useState(boPhanId);
  const [baoGomDaKetThuc, setBaoGomDaKetThuc] = useState(false);

  if (boPhanId !== prevBoPhanId) {
    setPrevBoPhanId(boPhanId);
    setBaoGomDaKetThuc(false);
  }

  const [moDialogThemThanhVien, setMoDialogThemThanhVien] = useState(false);
  const {
    data: dsThanhVien,
    isLoading,
    isError,
    refetch,
  } = useDsThanhVien(boPhanId, baoGomDaKetThuc);

  const [thanhVienDoiVaiTro, setThanhVienDoiVaiTro] = useState<thanhVienBoPhanType | null>(null);
  const [thanhVienKetThuc, setThanhVienKetThuc] = useState<thanhVienBoPhanType | null>(null);



  return (
    <section className="min-w-0 flex-1 overflow-y-auto border-l px-4 py-5 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <h2 className="text-base font-semibold">Thành viên</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={baoGomDaKetThuc}
              onCheckedChange={(checked) => setBaoGomDaKetThuc(checked === true)}
            />
            Bao gồm thành viên đã kết thúc
          </label>
          <Button
            type="button"
            onClick={() => setMoDialogThemThanhVien(true)}
            disabled={!boPhanId}
          >
            Thêm thành viên
          </Button>
        </div>
      </header>

      {boPhanId && (
        <DialogThemThanhVien
          boPhanId={boPhanId}
          open={moDialogThemThanhVien}
          onOpenChange={setMoDialogThemThanhVien}
        />
      )}

      <DialogDoiVaiTro
        boPhanId={boPhanId}
        thanhVien={thanhVienDoiVaiTro}
        onOpenChange={(open) => {
          if (!open){
            setThanhVienDoiVaiTro(null);
          } 
        }}
      />

      <DialogKetThuc 
        key={thanhVienKetThuc?.nguoiDung.id ?? ""} 
        boPhanId={boPhanId} 
        thanhVien={thanhVienKetThuc} 
        onOpenChange={(open) => {
          if(!open){
            setThanhVienKetThuc(null);
          }
        }} 
      />

      {isLoading ? (
        <div aria-label="Đang tải danh sách thành viên" aria-live="polite">
          <BangThanhVienSkeleton baoGomDaKetThuc={baoGomDaKetThuc} />
        </div>
      ) : isError ? (
        <div className="space-y-3 py-6">
          <p className="text-sm text-muted-foreground">
            Đã xảy ra lỗi khi tải danh sách thành viên. Vui lòng thử lại.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      ) : !dsThanhVien || dsThanhVien.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Bộ phận chưa có thành viên.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              {baoGomDaKetThuc && <TableHead>Ngày kết thúc</TableHead>}
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dsThanhVien.map((thanhVien) => (
              <DongThanhVien
                key={thanhVien.nguoiDung.id}
                thanhVien={thanhVien}
                baoGomDaKetThuc={baoGomDaKetThuc}
                onDoiVaiTro={() => setThanhVienDoiVaiTro(thanhVien)}
                onKetThuc={() => setThanhVienKetThuc(thanhVien)}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
