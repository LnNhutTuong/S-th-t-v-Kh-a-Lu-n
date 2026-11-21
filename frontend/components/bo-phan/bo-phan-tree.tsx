"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCayBoPhan, useThieuLanhDao } from "@/hooks/use-bo-phan";
import { Skeleton } from "@/components/ui/skeleton";
import {Alert} from "@/components/ui/alert";
import {  
  type boPhanTreeType,
  type NhomDonVi as NhomDonViType,
  TEN_NHOM,
  THU_TU_NHOM,
  boPhanThieuLanhDaoType
} from "@/features/boPhan/type/boPhan.type";


type NhomNode = {
  nhom: NhomDonViType;
  tenNhom: string;
  boPhans: boPhanTreeType[];
};

function gomNhomBoPhan(items: boPhanTreeType[]): NhomNode[] {
  const map = new Map<NhomDonViType, boPhanTreeType[]>();

  items.forEach((item) => {
    const nhom = item.nhom as NhomDonViType;
    if (!map.has(nhom)) {
      map.set(nhom, []);
    }
    map.get(nhom)!.push(item);
  });

  return THU_TU_NHOM.filter((nhom) => map.has(nhom)).map((nhom) => ({
    nhom,
    tenNhom: TEN_NHOM[nhom] ?? nhom,
    boPhans: map.get(nhom)!,
  }));
}

// Component Skeleton hiển thị trạng thái đang tải dữ liệu cây
function TreeSkeleton() {
  return (
    <div className="py-2 px-3 space-y-2">
      {/* Node gốc (Trường ĐHAG) */}
      <div className="flex items-center gap-2 py-1">
        <Skeleton className="w-3.5 h-3.5 bg-slate-200" />
        <Skeleton className="h-4 w-44 bg-slate-200" />
      </div>

      {/* Khối phòng ban */}
      <div className="pl-4 space-y-2 pt-0.5">
        <div className="flex items-center gap-2 py-0.5">
          <Skeleton className="w-3 h-3 bg-slate-200" />
          <Skeleton className="h-3.5 w-40 bg-slate-200" />
        </div>
        <div className="pl-4 space-y-2">
          <Skeleton className="h-3.5 w-36 bg-slate-200" />
          <Skeleton className="h-3.5 w-28 bg-slate-200" />
          <Skeleton className="h-3.5 w-40 bg-slate-200" />
        </div>
      </div>

      {/* Khối khoa chuyên môn */}
      <div className="pl-4 space-y-2 pt-1">
        <div className="flex items-center gap-2 py-0.5">
          <Skeleton className="w-3 h-3 bg-slate-200" />
          <Skeleton className="h-3.5 w-36 bg-slate-200" />
        </div>
        <div className="pl-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 bg-slate-200" />
            <Skeleton className="h-3.5 w-36 bg-slate-200" />
          </div>
          <div className="pl-4 space-y-1.5">
            <Skeleton className="h-3 w-32 bg-slate-200" />
            <Skeleton className="h-3 w-28 bg-slate-200" />
          </div>
          <Skeleton className="h-3.5 w-28 bg-slate-200" />
          <Skeleton className="h-3.5 w-48 bg-slate-200" />
        </div>
      </div>

      {/* Khối trung tâm & đơn vị */}
      <div className="pl-4 space-y-2 pt-1">
        <div className="flex items-center gap-2 py-0.5">
          <Skeleton className="w-3 h-3 bg-slate-200" />
          <Skeleton className="h-3.5 w-48 bg-slate-200" />
        </div>
        <div className="pl-4 space-y-2">
          <Skeleton className="h-3.5 w-44 bg-slate-200" />
          <Skeleton className="h-3.5 w-32 bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

type Props = { boPhanDangChon: string | null; onChon: (id: string) => void };


export default function BoPhanTree({boPhanDangChon, onChon }: Props) {


  const [baoGomDungHoatDong, setBaoGomDungHoatDong] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");

  

  const [cacNhanhMo, setCacNhanhMo] = useState<Set<string>>(new Set());
  const daKhoiTaoMoNhanh = useRef(false);

  const { data, isLoading, isError, error } = useCayBoPhan(baoGomDungHoatDong);

  const {data: danhSachBoPhanThieuLanhDao} = useThieuLanhDao();

  const danhSachBoPhan: boPhanTreeType[] = data ?? [];

  //thằng này trả ra cái map với cái key: id, value xong đem xuống dưới xài => map thì có has
  const thieuMap = useMemo(() => new Map<string, boPhanThieuLanhDaoType>(danhSachBoPhanThieuLanhDao?.danhSachBoPhanThieu.map((b) => [b.id, b])), [danhSachBoPhanThieuLanhDao]);

  // Lọc cây: giữ lại cả đơn vị cha nếu có đơn vị con khớp từ khóa
  const locCay = (
    items: boPhanTreeType[],
    keyword: string
  ): boPhanTreeType[] => {
    if (!keyword) return items;

    return items.reduce<boPhanTreeType[]>((result, item) => {
      const conDaLoc = locCay(item.con ?? [], keyword);
      const khop =
        item.ten.toLowerCase().includes(keyword) ||
        item.ma.toLowerCase().includes(keyword);

      if (khop || conDaLoc.length > 0) {
        result.push({
          ...item,
          con: conDaLoc,
        });
      }

      return result;
    }, []);
  };

  const cayDaLoc = useMemo(
    () => locCay(danhSachBoPhan, tuKhoa.trim().toLowerCase()),
    [danhSachBoPhan, tuKhoa]
  );

  // Đếm toàn bộ bộ phận trong cây
  const tongSoBoPhan = useMemo(() => {
    const dem = (items: boPhanTreeType[]): number =>
      items.reduce((sum, item) => sum + 1 + dem(item.con ?? []), 0);

    return dem(danhSachBoPhan);
  }, [danhSachBoPhan]);

  // Lấy toàn bộ ID để mở/thu gọn nhanh
  const tatCaId = useMemo(() => {
    const ids: string[] = [];

    const duyet = (items: boPhanTreeType[]) => {
      items.forEach((item) => {
        ids.push(item.id);

        if (item.con && item.con.length > 0) {
          gomNhomBoPhan(item.con).forEach((nhom) => {
            ids.push(`nhom-${item.id}-${nhom.nhom}`);
          });
          duyet(item.con);
        }
      });
    };

    duyet(danhSachBoPhan);
    return ids;
  }, [danhSachBoPhan]);

  // Tự động mở rộng các nhánh khi tải dữ liệu lần đầu
  useEffect(() => {
    if (tatCaId.length > 0 && !daKhoiTaoMoNhanh.current) {
      setCacNhanhMo(new Set(tatCaId));
      daKhoiTaoMoNhanh.current = true;
    }
  }, [tatCaId]);

  const doiTrangThaiNhanh = (id: string) => {
    setCacNhanhMo((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moTatCa = () => setCacNhanhMo(new Set(tatCaId));
  const thuTatCa = () => setCacNhanhMo(new Set());

  // Render một đơn vị bộ phận (dùng cho các cấp con)
  const renderItem = (item: boPhanTreeType, paddingLeft: number) => {
    const coCon = item.con && item.con.length > 0;
    const dangMo = cacNhanhMo.has(item.id);
    const dangChon = boPhanDangChon === item.id;

    return (
      <div key={item.id}>
        <div
          onClick={() => onChon(item.id)}
          className={`group flex items-center gap-1.5 py-1.5 pr-3 text-[13px] cursor-pointer transition-colors ${
            dangChon
              ? "bg-[#EBF3FB] text-[#003B5C] font-semibold border-l-[3px] border-[#003B5C]"
              : "text-slate-800 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent"
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {coCon ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                doiTrangThaiNhanh(item.id);
              }}
              className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-600 text-[10px]"
            >
              {dangMo ? "▾" : "▸"}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-300 text-[10px]">
              ·
            </span>
          )}

          <span className="truncate" title={item.ten}>
            {item.ten}
          </span>

          {thieuMap.has(item.id) &&
           <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" title="Thiếu Trưởng/Phó" />
          }

          {item.ngungHoatDong && (
            <span className="ml-auto text-[10px] text-slate-400 shrink-0 font-normal">
              (Ngừng HĐ)
            </span>
          )}
        </div>

        {/* Các đơn vị trực thuộc (ví dụ Bộ môn trực thuộc Khoa) */}
        {coCon && dangMo && (
          <div>
            {item.con.map((con) => renderItem(con, paddingLeft + 16))}
          </div>
        )}
      </div>
    );
  };

  // Render một đơn vị gốc (ví dụ Trường ĐH An Giang / Ban Giám Hiệu)
  // Các con trực tiếp của đơn vị gốc được gom theo các Khối như ảnh
  const renderRootNode = (root: boPhanTreeType) => {
    const coCon = root.con && root.con.length > 0;
    const dangMo = cacNhanhMo.has(root.id);
    const dangChon = boPhanDangChon === root.id;
    const nhomList = coCon ? gomNhomBoPhan(root.con) : [];

    return (
      <div key={root.id}>
        {/* Đơn vị cấp cao nhất (Trường ĐHAG) */}
        <div
          onClick={() => onChon(root.id)}
          className={`group flex items-center gap-1.5 py-1.5 pr-3 pl-2 text-[13px] font-medium cursor-pointer transition-colors ${
            dangChon
              ? "bg-[#EBF3FB] text-[#003B5C] font-semibold border-l-[3px] border-[#003B5C]"
              : "text-slate-800 hover:bg-slate-50 border-l-[3px] border-transparent"
          }`}
        >
          {coCon ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                doiTrangThaiNhanh(root.id);
              }}
              className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-600 text-[10px]"
            >
              {dangMo ? "▾" : "▸"}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-300 text-[10px]">
              ·
            </span>
          )}
          <span className="truncate" title={root.ten}>
            {root.ten}
          </span>
        </div>

        {/* Các Khối trực thuộc đơn vị cấp cao */}
        {coCon && dangMo && (
          <div>
            {nhomList.length > 0 ? (
              nhomList.map((nhom) => {
                const nhomId = `nhom-${root.id}-${nhom.nhom}`;
                const moNhom = cacNhanhMo.has(nhomId);

                return (
                  <div key={nhomId}>
                    {/* Tiêu đề Khối */}
                    <div
                      onClick={() => doiTrangThaiNhanh(nhomId)}
                      className="flex items-center gap-1.5 py-1.5 pr-3 pl-6 text-[11px] font-bold text-slate-700 uppercase tracking-tight cursor-pointer hover:bg-slate-50 select-none"
                    >
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-slate-600 text-[10px]">
                        {moNhom ? "▾" : "▸"}
                      </span>
                      <span className="truncate">{nhom.tenNhom}</span>
                    </div>

                    {/* Danh sách các đơn vị trong Khối */}
                    {moNhom && (
                      <div>
                        {nhom.boPhans.map((boPhan) =>
                          renderItem(boPhan, 32)
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div>
                {root.con.map((child) => renderItem(child, 20))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-[360px] xl:w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Header khu vực cây */}
      <div className="px-3.5 pt-3.5 pb-2.5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
            Cơ cấu tổ chức
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={moTatCa}
              className="text-[#003B5C] font-medium hover:underline cursor-pointer"
            >
              Mở rộng
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={thuTatCa}
              className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Thu gọn
            </button>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative">
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Lọc theo tên hoặc mã đơn vị..."
            className="rounded-xl w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003B5C]"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => setTuKhoa("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tổng số đơn vị và bộ lọc trạng thái */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            Tổng số:{" "}
            {isLoading ? (
              <Skeleton className="inline-block w-5 h-3 bg-slate-200" />
            ) : (
              <strong className="font-semibold text-slate-700 tabular-nums">
                {tongSoBoPhan}
              </strong>
            )}{" "}
            đơn vị
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700">
            <input
              type="checkbox"
              checked={baoGomDungHoatDong}
              onChange={(e) => setBaoGomDungHoatDong(e.target.checked)}
              className="rounded-[2px] border-slate-300 text-[#003B5C] focus:ring-0"
            />
            <span>Bao gồm ngừng HĐ</span>
          </label>
        </div>
   
        <div className="w-full pt-1 text-[11px] flex justify-between items-center gap-1">
          <div className="text-slate-500">
            <span className="flex items-center gap-1">
            Số BP thiếu Trưởng / Phó:{" "}
            {isLoading ? (
              <Skeleton className="inline-block w-5 h-3 bg-slate-200" />
            ) : (
              <strong className="font-semibold text-slate-700 tabular-nums">
                {danhSachBoPhanThieuLanhDao?.soBoPhanThieu}
              </strong>
            )}{" "}
            đơn vị
          </span>
            
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 " title="Thiếu Trưởng/Phó" />
            <span className="font-bold text-orange-400">Cảnh báo thiếu Trưởng / Phó</span>
          </div>
          
        </div>        
      </div>

      {/* Nội dung cây */}
      <div
        className="flex-1 overflow-y-auto py-1"
        role="tree"
        aria-label="Cây cơ cấu tổ chức"
      >
        {isLoading && <TreeSkeleton />}

        {isError && (
          <div className="p-4 text-xs text-red-600">
            Không thể tải cơ cấu tổ chức:{" "}
            {error instanceof Error ? error.message : "Đã xảy ra lỗi"}
          </div>
        )}

        {!isLoading && !isError && cayDaLoc.length === 0 && (
          <div className="p-4 text-xs text-slate-500">
            {tuKhoa
              ? "Không tìm thấy bộ phận phù hợp."
              : "Hiện tại không có bộ phận nào."}
          </div>
        )}

        {!isLoading &&
          !isError &&
          cayDaLoc.map((item) => renderRootNode(item))}
      </div>
    </aside>
  );
}
