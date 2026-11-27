import { useBoPhan, useThieuLanhDao } from "@/hooks/use-bo-phan";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaiBoPhan, TEN_LOAI_BO_PHAN, TEN_NHOM_BO_PHAN, boPhanThieuLanhDaoType, boPhanType } from "@/features/bo-phan/type/boPhan.type"
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { CHA_HOP_LE } from "@/features/bo-phan/type/boPhan.type";

type Props = { boPhanId: string | null; onSua: (boPhan: boPhanType) => void, onNgungHoatDong: (boPhan: boPhanType) => void, onThemCon: (boPhanId: string) => void};

function DongThongTin({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{nhan}</dt>
      <dd className="min-w-0 break-words text-sm">{giaTri || "—"}</dd>
    </div>
  );
}

function ChiTietSkeleton() {
  return (
    <div className="space-y-6" aria-label="Đang tải thông tin bộ phận">
      <div className="space-y-2 border-b pb-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-64 max-w-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="grid gap-2 border-b py-3 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-4" key={index}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BoPhanChiTiet({ boPhanId, onSua, onNgungHoatDong, onThemCon }: Props) {
  const { data: boPhan, isLoading, isError, refetch } = useBoPhan(boPhanId);
  const {data: danhSachBoPhanThieuLanhDao} = useThieuLanhDao();
  //thằng này trả ra cái map với cái key: id, value xong đem xuống dưới xài => map thì có has
  const thieuMap = useMemo(() => new Map<string, boPhanThieuLanhDaoType>(danhSachBoPhanThieuLanhDao?.danhSachBoPhanThieu.map((b) => [b.id, b])), [danhSachBoPhanThieuLanhDao]);

  if (isLoading) {
    return (
      <section className="min-w-0 flex-1 px-4 py-5 sm:px-6" aria-live="polite">
        <ChiTietSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md space-y-3 p-5 shadow-none">
          <h2 className="text-base font-semibold">Không thể tải thông tin</h2>
          <p className="text-sm text-muted-foreground">
            Đã xảy ra lỗi khi tải dữ liệu bộ phận. Vui lòng thử lại.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Thử lại
          </Button>
        </Card>
      </section>
    );
  }

  if (!boPhan) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center px-6 py-10">
        <p className="text-sm text-muted-foreground">
          Không tìm thấy thông tin bộ phận.
        </p>
      </section>
    );
  }

  const coTheLamCha = !boPhan.ngungHoatDong && Object.values(CHA_HOP_LE).some((dsLoai) => dsLoai.includes(boPhan.loai));

  return (
    <section className="min-w-0 flex-1 py-5 sm:px-6">
      <header className="mb-5 border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Chi tiết bộ phận</p>
            <div className="flex items-center gap-2">
              <h2 className="break-words text-xl font-semibold">{boPhan.ten}</h2>
              {thieuMap.has(boPhan.id) && <Badge variant="warning">{thieuMap.get(boPhan.id)?.thieuPho && thieuMap.get(boPhan.id)?.thieuTruong ? 'Thiếu Trưởng / Phó' : thieuMap.get(boPhan.id)?.thieuTruong ? 'Thiếu Trưởng' : 'Thiếu Phó'}</Badge>}    
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Button type="button" size="sm" className="ml-auto bg-yellow-400/70 text-black hover:bg-yellow-500/90 cursor-pointer" onClick={() => onSua(boPhan)}>Sửa thông tin</Button>
            {coTheLamCha && 
            <Button type="button" size="sm" className="ml-auto bg-green-400/70 text-black hover:bg-green-500/90 cursor-pointer" onClick={() => onThemCon(boPhan.id)}>Thêm bộ phận con</Button>}
            {
              boPhan.loai !== LoaiBoPhan.BAN_GIAM_HIEU && 
              <Button
              type="button"
              size="sm"
              variant={boPhan.ngungHoatDong ? "default" : "destructive"}
              className="ml-auto"
              onClick={() => onNgungHoatDong(boPhan)}
            >
              {boPhan.ngungHoatDong ? "Kích hoạt lại" : "Ngừng hoạt động"}
            </Button>
            }
            
          </div>
          
        </div>
      </header>

      <Card className="rounded-lg p-4 shadow-none sm:p-5">
        <h3 className="mb-2 text-sm font-semibold">Thông tin chung</h3>
        <dl>
          <DongThongTin nhan="Mã bộ phận" giaTri={boPhan.ma} />
          <DongThongTin
            nhan="Loại bộ phận"
            giaTri={TEN_LOAI_BO_PHAN[boPhan.loai] ?? boPhan.loai}
          />
          <DongThongTin
            nhan="Nhóm đơn vị"
            giaTri={boPhan.nhom ? TEN_NHOM_BO_PHAN[boPhan.nhom] : ""}
          />
          <DongThongTin nhan="Bộ phận cha" giaTri={boPhan.boPhanCha?.ten ?? ""} />
          <DongThongTin
            nhan="Trạng thái"
            giaTri={boPhan.ngungHoatDong ? "Ngừng hoạt động" : "Đang hoạt động"}
          />
        </dl>
      </Card>
    </section>
  );
}
