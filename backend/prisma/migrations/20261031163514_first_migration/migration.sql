-- CreateEnum
CREATE TYPE "NhomDonVi" AS ENUM ('DAO_TAO', 'CHUC_NANG', 'SU_NGHIEP');

-- CreateEnum
CREATE TYPE "LoaiBoPhan" AS ENUM ('BAN_GIAM_HIEU', 'KHOA', 'BO_MON', 'PHONG', 'VIEN', 'TRUNG_TAM', 'THU_VIEN', 'TRUONG');

-- CreateEnum
CREATE TYPE "CapBac" AS ENUM ('TRUONG', 'PHO', 'THANH_VIEN');

-- CreateEnum
CREATE TYPE "PhamViVaiTro" AS ENUM ('HE_THONG', 'BO_PHAN', 'DE_TAI');

-- CreateEnum
CREATE TYPE "MucUuTien" AS ENUM ('THAP', 'TRUNG_BINH', 'CAO', 'KHAN_CAP');

-- CreateEnum
CREATE TYPE "NguonTaoNhiemVu" AS ENUM ('TU_DANG_KY', 'DUOC_GIAO');

-- CreateEnum
CREATE TYPE "LoaiDeTai" AS ENUM ('DE_TAI', 'DE_AN');

-- CreateEnum
CREATE TYPE "LoaiDauRa" AS ENUM ('TAI_LIEU', 'LIEN_KET', 'KHAC');

-- CreateEnum
CREATE TYPE "TrangThaiMinhChung" AS ENUM ('CHO_DUYET', 'DA_CHAP_NHAN', 'BI_TRA_LAI');

-- CreateEnum
CREATE TYPE "TrangThaiVanBan" AS ENUM ('CON_HIEU_LUC', 'HET_HIEU_LUC', 'DA_AN');

-- CreateEnum
CREATE TYPE "LoaiPheDuyet" AS ENUM ('GIAO_NGANG', 'DANG_KY');

-- CreateEnum
CREATE TYPE "TrangThaiPheDuyet" AS ENUM ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI');

-- CreateEnum
CREATE TYPE "NhomChiSo" AS ENUM ('MUC_TIEU', 'KET_QUA');

-- CreateEnum
CREATE TYPE "CapApDungCongThuc" AS ENUM ('NHIEM_VU', 'KY');

-- CreateEnum
CREATE TYPE "KieuChamTieuChi" AS ENUM ('NHI_PHAN', 'DIEM');

-- CreateEnum
CREATE TYPE "TrangThaiPhieu" AS ENUM ('NHAP', 'DA_NOP', 'DANG_CHAM', 'CHO_XAC_NHAN', 'HOAN_TAT');

-- CreateEnum
CREATE TYPE "LoaiNguoiCham" AS ENUM ('CHAM', 'XAC_NHAN');

-- CreateEnum
CREATE TYPE "LoaiNhapExcel" AS ENUM ('BO_PHAN', 'NGUOI_DUNG', 'NHIEM_VU', 'DE_TAI');

-- CreateEnum
CREATE TYPE "TrangThaiPhienNhap" AS ENUM ('XEM_TRUOC', 'DA_DUYET', 'DA_HUY', 'LOI');

-- CreateTable
CREATE TABLE "NguoiDung" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "anhDaiDien" TEXT,
    "ngaySinh" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoPhan" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "loai" "LoaiBoPhan" NOT NULL,
    "nhom" "NhomDonVi",
    "boPhanChaId" TEXT,
    "ngungHoatDong" BOOLEAN NOT NULL DEFAULT false,
    "thongTinThem" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoPhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThanhVienBoPhan" (
    "nguoiDungId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "vaiTroId" TEXT NOT NULL,
    "capBac" "CapBac" NOT NULL,
    "ngayThamGia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayKetThuc" TIMESTAMP(3),

    CONSTRAINT "ThanhVienBoPhan_pkey" PRIMARY KEY ("nguoiDungId","boPhanId")
);

-- CreateTable
CREATE TABLE "VaiTro" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "phamVi" "PhamViVaiTro" NOT NULL,
    "loaiBoPhan" "LoaiBoPhan",
    "capBac" "CapBac",
    "soLuongToiDa" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuyenHan" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "moTa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuyenHan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaiTroQuyenHan" (
    "vaiTroId" TEXT NOT NULL,
    "quyenHanId" TEXT NOT NULL,

    CONSTRAINT "VaiTroQuyenHan_pkey" PRIMARY KEY ("vaiTroId","quyenHanId")
);

-- CreateTable
CREATE TABLE "NguoiDungVaiTro" (
    "nguoiDungId" TEXT NOT NULL,
    "vaiTroId" TEXT NOT NULL,

    CONSTRAINT "NguoiDungVaiTro_pkey" PRIMARY KEY ("nguoiDungId","vaiTroId")
);

-- CreateTable
CREATE TABLE "TepTin" (
    "id" TEXT NOT NULL,
    "tenGoc" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "kichThuoc" INTEGER NOT NULL,
    "khoaLuuTru" TEXT NOT NULL,
    "nhaCungCap" TEXT NOT NULL,
    "nguoiTaiLenId" TEXT NOT NULL,
    "taiLenLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TepTin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoaiVanBan" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "dangDung" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LoaiVanBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VanBan" (
    "id" TEXT NOT NULL,
    "soHieu" TEXT,
    "trichYeu" TEXT NOT NULL,
    "loaiVanBanId" TEXT NOT NULL,
    "coQuanBanHanh" TEXT,
    "ngayBanHanh" DATE,
    "boPhanQuanLyId" TEXT,
    "tepTinId" TEXT NOT NULL,
    "trangThai" "TrangThaiVanBan" NOT NULL DEFAULT 'CON_HIEU_LUC',
    "nguoiTaiLenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VanBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VanBanNhiemVu" (
    "vanBanId" TEXT NOT NULL,
    "nhiemVuId" TEXT NOT NULL,

    CONSTRAINT "VanBanNhiemVu_pkey" PRIMARY KEY ("vanBanId","nhiemVuId")
);

-- CreateTable
CREATE TABLE "VanBanDeTai" (
    "vanBanId" TEXT NOT NULL,
    "deTaiId" TEXT NOT NULL,

    CONSTRAINT "VanBanDeTai_pkey" PRIMARY KEY ("vanBanId","deTaiId")
);

-- CreateTable
CREATE TABLE "DeTaiDeAn" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "loai" "LoaiDeTai" NOT NULL,
    "boPhanChuTriId" TEXT NOT NULL,
    "ngayBatDau" DATE,
    "ngayKetThuc" DATE,
    "daKichHoat" BOOLEAN NOT NULL DEFAULT false,
    "thongTinThem" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeTaiDeAn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeTaiBoPhan" (
    "deTaiId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,

    CONSTRAINT "DeTaiBoPhan_pkey" PRIMARY KEY ("deTaiId","boPhanId")
);

-- CreateTable
CREATE TABLE "ThanhVienDeTai" (
    "deTaiId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "vaiTroId" TEXT NOT NULL,

    CONSTRAINT "ThanhVienDeTai_pkey" PRIMARY KEY ("deTaiId","nguoiDungId")
);

-- CreateTable
CREATE TABLE "NhiemVu" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "moTa" TEXT,
    "mucUuTien" "MucUuTien" NOT NULL DEFAULT 'TRUNG_BINH',
    "hanHoanThanh" TIMESTAMP(3),
    "nguonTao" "NguonTaoNhiemVu" NOT NULL DEFAULT 'DUOC_GIAO',
    "moTaKpi" TEXT,
    "thongTinThem" JSONB,
    "boPhanQuanLyId" TEXT NOT NULL,
    "deTaiId" TEXT,
    "nhiemVuChaId" TEXT,
    "nguoiTaoId" TEXT NOT NULL,
    "congThucId" TEXT,
    "buocQuyTrinhId" TEXT,
    "coHieuLuc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NhiemVu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhiemVuNguoiThucHien" (
    "nhiemVuId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "buocQuyTrinhId" TEXT,
    "nguoiGiaoId" TEXT,
    "ngayGiao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayHoanThanh" TIMESTAMP(3),

    CONSTRAINT "NhiemVuNguoiThucHien_pkey" PRIMARY KEY ("nhiemVuId","nguoiDungId")
);

-- CreateTable
CREATE TABLE "PheDuyetNhiemVu" (
    "id" TEXT NOT NULL,
    "nhiemVuId" TEXT NOT NULL,
    "loai" "LoaiPheDuyet" NOT NULL,
    "boPhanGiaoId" TEXT,
    "boPhanNhanId" TEXT,
    "boPhanDuyetId" TEXT NOT NULL,
    "trangThai" "TrangThaiPheDuyet" NOT NULL DEFAULT 'CHO_DUYET',
    "nguoiYeuCauId" TEXT NOT NULL,
    "nguoiDuyetId" TEXT,
    "lyDo" TEXT,
    "thoiGianYeuCau" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thoiGianXuLy" TIMESTAMP(3),

    CONSTRAINT "PheDuyetNhiemVu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DauRaNhiemVu" (
    "id" TEXT NOT NULL,
    "nhiemVuId" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "moTa" TEXT,
    "loaiDauRa" "LoaiDauRa" NOT NULL DEFAULT 'TAI_LIEU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DauRaNhiemVu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinhChung" (
    "id" TEXT NOT NULL,
    "dauRaId" TEXT NOT NULL,
    "tepTinId" TEXT NOT NULL,
    "trangThai" "TrangThaiMinhChung" NOT NULL DEFAULT 'CHO_DUYET',
    "ghiChuDuyet" TEXT,
    "nguoiNopId" TEXT NOT NULL,
    "nopLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiDuyetId" TEXT,
    "duyetLuc" TIMESTAMP(3),

    CONSTRAINT "MinhChung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuyTrinh" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "boPhanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuyTrinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuocQuyTrinh" (
    "id" TEXT NOT NULL,
    "quyTrinhId" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "nhan" TEXT NOT NULL,
    "laBuocDau" BOOLEAN NOT NULL DEFAULT false,
    "laBuocCuoi" BOOLEAN NOT NULL DEFAULT false,
    "mau" TEXT,
    "thuTu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuocQuyTrinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChuyenBuoc" (
    "id" TEXT NOT NULL,
    "quyTrinhId" TEXT NOT NULL,
    "tuBuocId" TEXT NOT NULL,
    "denBuocId" TEXT NOT NULL,
    "nhan" TEXT,

    CONSTRAINT "ChuyenBuoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MucTieu" (
    "id" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "moTa" TEXT,
    "ngayBatDau" DATE,
    "ngayKetThuc" DATE,
    "boPhanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MucTieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KetQuaChinh" (
    "id" TEXT NOT NULL,
    "mucTieuId" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "moTa" TEXT,
    "giaTriBatDau" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "giaTriHienTai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "giaTriMucTieu" DOUBLE PRECISION NOT NULL,
    "donViDo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KetQuaChinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhiemVuKetQuaChinh" (
    "nhiemVuId" TEXT NOT NULL,
    "ketQuaChinhId" TEXT NOT NULL,

    CONSTRAINT "NhiemVuKetQuaChinh_pkey" PRIMARY KEY ("nhiemVuId","ketQuaChinhId")
);

-- CreateTable
CREATE TABLE "ChiSo" (
    "id" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "khoa" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "donViDo" TEXT,
    "nhom" "NhomChiSo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiSo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CongThuc" (
    "id" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "bieuThuc" TEXT NOT NULL,
    "bieuThucToiDa" TEXT,
    "moTa" TEXT,
    "phienBan" INTEGER NOT NULL DEFAULT 1,
    "capApDung" "CapApDungCongThuc" NOT NULL DEFAULT 'NHIEM_VU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CongThuc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiaTriChiSo" (
    "id" TEXT NOT NULL,
    "nhiemVuId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "chiSoId" TEXT NOT NULL,
    "giaTri" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "GiaTriChiSo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiChot" (
    "id" TEXT NOT NULL,
    "nhiemVuId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "diemDat" DOUBLE PRECISION NOT NULL,
    "diemToiDa" DOUBLE PRECISION NOT NULL,
    "bieuThuc" TEXT NOT NULL,
    "bieuThucToiDa" TEXT,
    "phienBan" INTEGER NOT NULL,
    "giaTriChiSo" JSONB NOT NULL,
    "tinhLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiChot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KyDanhGia" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "ngayBatDau" DATE NOT NULL,
    "ngayKetThuc" DATE NOT NULL,
    "tyTrongKpiMacDinh" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "tyTrongTieuChiMacDinh" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KyDanhGia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CauHinhKyBoPhan" (
    "kyId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "tyTrongKpi" DOUBLE PRECISION NOT NULL,
    "tyTrongTieuChi" DOUBLE PRECISION NOT NULL,
    "congThucKyId" TEXT,

    CONSTRAINT "CauHinhKyBoPhan_pkey" PRIMARY KEY ("kyId","boPhanId")
);

-- CreateTable
CREATE TABLE "TieuChiDanhGia" (
    "id" TEXT NOT NULL,
    "kyId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "tieuChiChaId" TEXT,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "kieuCham" "KieuChamTieuChi" NOT NULL DEFAULT 'DIEM',
    "diemToiDa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thuTu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TieuChiDanhGia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuyTacXepLoai" (
    "id" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "nhan" TEXT NOT NULL,
    "diemTu" DOUBLE PRECISION NOT NULL,
    "diemDen" DOUBLE PRECISION NOT NULL,
    "moTa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuyTacXepLoai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhieuDanhGia" (
    "id" TEXT NOT NULL,
    "kyId" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "boPhanId" TEXT NOT NULL,
    "trangThai" "TrangThaiPhieu" NOT NULL DEFAULT 'NHAP',
    "diemKpi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diemTieuChi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diemTong" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xepLoai" TEXT,
    "tuNhanXet" TEXT,
    "nguoiXacNhanId" TEXT,
    "xacNhanLuc" TIMESTAMP(3),
    "nhanXetXacNhan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PhieuDanhGia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KetQuaTuDanhGia" (
    "phieuId" TEXT NOT NULL,
    "tieuChiId" TEXT NOT NULL,
    "diemTuCham" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "damBao" BOOLEAN,
    "nhanXet" TEXT,

    CONSTRAINT "KetQuaTuDanhGia_pkey" PRIMARY KEY ("phieuId","tieuChiId")
);

-- CreateTable
CREATE TABLE "NguoiChamPhieu" (
    "id" TEXT NOT NULL,
    "phieuId" TEXT NOT NULL,
    "nguoiChamId" TEXT NOT NULL,
    "loai" "LoaiNguoiCham" NOT NULL,
    "nhanXet" TEXT,
    "chamLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NguoiChamPhieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiemChamTieuChi" (
    "nguoiChamPhieuId" TEXT NOT NULL,
    "tieuChiId" TEXT NOT NULL,
    "diem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nhanXet" TEXT,

    CONSTRAINT "DiemChamTieuChi_pkey" PRIMARY KEY ("nguoiChamPhieuId","tieuChiId")
);

-- CreateTable
CREATE TABLE "ThongBao" (
    "id" TEXT NOT NULL,
    "nguoiNhanId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "noiDung" TEXT,
    "duongDan" TEXT,
    "daDoc" BOOLEAN NOT NULL DEFAULT false,
    "daGuiEmail" BOOLEAN NOT NULL DEFAULT false,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhienNhapExcel" (
    "id" TEXT NOT NULL,
    "loai" "LoaiNhapExcel" NOT NULL,
    "nguoiTaoId" TEXT NOT NULL,
    "tenFile" TEXT NOT NULL,
    "trangThai" "TrangThaiPhienNhap" NOT NULL DEFAULT 'XEM_TRUOC',
    "duLieuXemTruoc" JSONB,
    "loi" JSONB,
    "tomTat" JSONB,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hetHanLuc" TIMESTAMP(3) NOT NULL,
    "duyetLuc" TIMESTAMP(3),

    CONSTRAINT "PhienNhapExcel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- CreateIndex
CREATE INDEX "NguoiDung_deletedAt_idx" ON "NguoiDung"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BoPhan_ma_key" ON "BoPhan"("ma");

-- CreateIndex
CREATE INDEX "BoPhan_boPhanChaId_idx" ON "BoPhan"("boPhanChaId");

-- CreateIndex
CREATE INDEX "BoPhan_loai_idx" ON "BoPhan"("loai");

-- CreateIndex
CREATE INDEX "ThanhVienBoPhan_boPhanId_capBac_idx" ON "ThanhVienBoPhan"("boPhanId", "capBac");

-- CreateIndex
CREATE INDEX "ThanhVienBoPhan_vaiTroId_idx" ON "ThanhVienBoPhan"("vaiTroId");

-- CreateIndex
CREATE UNIQUE INDEX "ThanhVienBoPhan_mot_truong_con_hieu_luc_idx" 
ON "ThanhVienBoPhan"("boPhanId") 
WHERE "capBac" = 'TRUONG' AND "ngayKetThuc" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_ma_key" ON "VaiTro"("ma");

-- CreateIndex
CREATE INDEX "VaiTro_phamVi_loaiBoPhan_idx" ON "VaiTro"("phamVi", "loaiBoPhan");

-- CreateIndex
CREATE UNIQUE INDEX "QuyenHan_ma_key" ON "QuyenHan"("ma");

-- CreateIndex
CREATE INDEX "TepTin_nguoiTaiLenId_idx" ON "TepTin"("nguoiTaiLenId");

-- CreateIndex
CREATE UNIQUE INDEX "TepTin_nhaCungCap_khoaLuuTru_key" ON "TepTin"("nhaCungCap", "khoaLuuTru");

-- CreateIndex
CREATE UNIQUE INDEX "LoaiVanBan_ma_key" ON "LoaiVanBan"("ma");

-- CreateIndex
CREATE INDEX "VanBan_loaiVanBanId_idx" ON "VanBan"("loaiVanBanId");

-- CreateIndex
CREATE INDEX "VanBan_trangThai_idx" ON "VanBan"("trangThai");

-- CreateIndex
CREATE INDEX "VanBan_boPhanQuanLyId_idx" ON "VanBan"("boPhanQuanLyId");

-- CreateIndex
CREATE UNIQUE INDEX "DeTaiDeAn_ma_key" ON "DeTaiDeAn"("ma");

-- CreateIndex
CREATE INDEX "DeTaiDeAn_boPhanChuTriId_idx" ON "DeTaiDeAn"("boPhanChuTriId");

-- CreateIndex
CREATE INDEX "DeTaiDeAn_deletedAt_idx" ON "DeTaiDeAn"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NhiemVu_ma_key" ON "NhiemVu"("ma");

-- CreateIndex
CREATE INDEX "NhiemVu_boPhanQuanLyId_deTaiId_idx" ON "NhiemVu"("boPhanQuanLyId", "deTaiId");

-- CreateIndex
CREATE INDEX "NhiemVu_nhiemVuChaId_idx" ON "NhiemVu"("nhiemVuChaId");

-- CreateIndex
CREATE INDEX "NhiemVu_hanHoanThanh_idx" ON "NhiemVu"("hanHoanThanh");

-- CreateIndex
CREATE INDEX "NhiemVu_deletedAt_idx" ON "NhiemVu"("deletedAt");

-- CreateIndex
CREATE INDEX "NhiemVuNguoiThucHien_nguoiDungId_idx" ON "NhiemVuNguoiThucHien"("nguoiDungId");

-- CreateIndex
CREATE INDEX "NhiemVuNguoiThucHien_boPhanId_idx" ON "NhiemVuNguoiThucHien"("boPhanId");

-- CreateIndex
CREATE INDEX "PheDuyetNhiemVu_nhiemVuId_idx" ON "PheDuyetNhiemVu"("nhiemVuId");

-- CreateIndex
CREATE INDEX "PheDuyetNhiemVu_boPhanDuyetId_trangThai_idx" ON "PheDuyetNhiemVu"("boPhanDuyetId", "trangThai");

-- CreateIndex
CREATE INDEX "DauRaNhiemVu_nhiemVuId_idx" ON "DauRaNhiemVu"("nhiemVuId");

-- CreateIndex
CREATE INDEX "MinhChung_dauRaId_idx" ON "MinhChung"("dauRaId");

-- CreateIndex
CREATE INDEX "MinhChung_trangThai_idx" ON "MinhChung"("trangThai");

-- CreateIndex
CREATE UNIQUE INDEX "QuyTrinh_boPhanId_key" ON "QuyTrinh"("boPhanId");

-- CreateIndex
CREATE INDEX "BuocQuyTrinh_quyTrinhId_thuTu_idx" ON "BuocQuyTrinh"("quyTrinhId", "thuTu");

-- CreateIndex
CREATE UNIQUE INDEX "BuocQuyTrinh_quyTrinhId_ten_key" ON "BuocQuyTrinh"("quyTrinhId", "ten");

-- CreateIndex
CREATE UNIQUE INDEX "ChuyenBuoc_quyTrinhId_tuBuocId_denBuocId_key" ON "ChuyenBuoc"("quyTrinhId", "tuBuocId", "denBuocId");

-- CreateIndex
CREATE INDEX "MucTieu_boPhanId_idx" ON "MucTieu"("boPhanId");

-- CreateIndex
CREATE INDEX "MucTieu_deletedAt_idx" ON "MucTieu"("deletedAt");

-- CreateIndex
CREATE INDEX "KetQuaChinh_mucTieuId_idx" ON "KetQuaChinh"("mucTieuId");

-- CreateIndex
CREATE UNIQUE INDEX "ChiSo_boPhanId_khoa_key" ON "ChiSo"("boPhanId", "khoa");

-- CreateIndex
CREATE INDEX "CongThuc_boPhanId_capApDung_idx" ON "CongThuc"("boPhanId", "capApDung");

-- CreateIndex
CREATE UNIQUE INDEX "GiaTriChiSo_nhiemVuId_nguoiDungId_chiSoId_key" ON "GiaTriChiSo"("nhiemVuId", "nguoiDungId", "chiSoId");

-- CreateIndex
CREATE UNIQUE INDEX "KpiChot_nhiemVuId_nguoiDungId_key" ON "KpiChot"("nhiemVuId", "nguoiDungId");

-- CreateIndex
CREATE INDEX "TieuChiDanhGia_kyId_boPhanId_idx" ON "TieuChiDanhGia"("kyId", "boPhanId");

-- CreateIndex
CREATE UNIQUE INDEX "QuyTacXepLoai_boPhanId_grade_key" ON "QuyTacXepLoai"("boPhanId", "grade");

-- CreateIndex
CREATE INDEX "PhieuDanhGia_nguoiDungId_idx" ON "PhieuDanhGia"("nguoiDungId");

-- CreateIndex
CREATE INDEX "PhieuDanhGia_boPhanId_trangThai_idx" ON "PhieuDanhGia"("boPhanId", "trangThai");

-- CreateIndex
CREATE UNIQUE INDEX "PhieuDanhGia_kyId_nguoiDungId_boPhanId_key" ON "PhieuDanhGia"("kyId", "nguoiDungId", "boPhanId");

-- CreateIndex
CREATE INDEX "NguoiChamPhieu_nguoiChamId_idx" ON "NguoiChamPhieu"("nguoiChamId");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiChamPhieu_phieuId_nguoiChamId_loai_key" ON "NguoiChamPhieu"("phieuId", "nguoiChamId", "loai");

-- CreateIndex
CREATE INDEX "ThongBao_nguoiNhanId_daDoc_taoLuc_idx" ON "ThongBao"("nguoiNhanId", "daDoc", "taoLuc");

-- CreateIndex
CREATE INDEX "PhienNhapExcel_nguoiTaoId_trangThai_idx" ON "PhienNhapExcel"("nguoiTaoId", "trangThai");

-- AddForeignKey
ALTER TABLE "BoPhan" ADD CONSTRAINT "BoPhan_boPhanChaId_fkey" FOREIGN KEY ("boPhanChaId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienBoPhan" ADD CONSTRAINT "ThanhVienBoPhan_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienBoPhan" ADD CONSTRAINT "ThanhVienBoPhan_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienBoPhan" ADD CONSTRAINT "ThanhVienBoPhan_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaiTroQuyenHan" ADD CONSTRAINT "VaiTroQuyenHan_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaiTroQuyenHan" ADD CONSTRAINT "VaiTroQuyenHan_quyenHanId_fkey" FOREIGN KEY ("quyenHanId") REFERENCES "QuyenHan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NguoiDungVaiTro" ADD CONSTRAINT "NguoiDungVaiTro_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NguoiDungVaiTro" ADD CONSTRAINT "NguoiDungVaiTro_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TepTin" ADD CONSTRAINT "TepTin_nguoiTaiLenId_fkey" FOREIGN KEY ("nguoiTaiLenId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBan" ADD CONSTRAINT "VanBan_loaiVanBanId_fkey" FOREIGN KEY ("loaiVanBanId") REFERENCES "LoaiVanBan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBan" ADD CONSTRAINT "VanBan_boPhanQuanLyId_fkey" FOREIGN KEY ("boPhanQuanLyId") REFERENCES "BoPhan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBan" ADD CONSTRAINT "VanBan_tepTinId_fkey" FOREIGN KEY ("tepTinId") REFERENCES "TepTin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBan" ADD CONSTRAINT "VanBan_nguoiTaiLenId_fkey" FOREIGN KEY ("nguoiTaiLenId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBanNhiemVu" ADD CONSTRAINT "VanBanNhiemVu_vanBanId_fkey" FOREIGN KEY ("vanBanId") REFERENCES "VanBan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBanNhiemVu" ADD CONSTRAINT "VanBanNhiemVu_nhiemVuId_fkey" FOREIGN KEY ("nhiemVuId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBanDeTai" ADD CONSTRAINT "VanBanDeTai_vanBanId_fkey" FOREIGN KEY ("vanBanId") REFERENCES "VanBan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VanBanDeTai" ADD CONSTRAINT "VanBanDeTai_deTaiId_fkey" FOREIGN KEY ("deTaiId") REFERENCES "DeTaiDeAn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeTaiDeAn" ADD CONSTRAINT "DeTaiDeAn_boPhanChuTriId_fkey" FOREIGN KEY ("boPhanChuTriId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeTaiBoPhan" ADD CONSTRAINT "DeTaiBoPhan_deTaiId_fkey" FOREIGN KEY ("deTaiId") REFERENCES "DeTaiDeAn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeTaiBoPhan" ADD CONSTRAINT "DeTaiBoPhan_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienDeTai" ADD CONSTRAINT "ThanhVienDeTai_deTaiId_fkey" FOREIGN KEY ("deTaiId") REFERENCES "DeTaiDeAn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienDeTai" ADD CONSTRAINT "ThanhVienDeTai_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVienDeTai" ADD CONSTRAINT "ThanhVienDeTai_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_boPhanQuanLyId_fkey" FOREIGN KEY ("boPhanQuanLyId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_deTaiId_fkey" FOREIGN KEY ("deTaiId") REFERENCES "DeTaiDeAn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_nhiemVuChaId_fkey" FOREIGN KEY ("nhiemVuChaId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_nguoiTaoId_fkey" FOREIGN KEY ("nguoiTaoId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_congThucId_fkey" FOREIGN KEY ("congThucId") REFERENCES "CongThuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVu" ADD CONSTRAINT "NhiemVu_buocQuyTrinhId_fkey" FOREIGN KEY ("buocQuyTrinhId") REFERENCES "BuocQuyTrinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuNguoiThucHien" ADD CONSTRAINT "NhiemVuNguoiThucHien_nhiemVuId_fkey" FOREIGN KEY ("nhiemVuId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuNguoiThucHien" ADD CONSTRAINT "NhiemVuNguoiThucHien_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuNguoiThucHien" ADD CONSTRAINT "NhiemVuNguoiThucHien_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuNguoiThucHien" ADD CONSTRAINT "NhiemVuNguoiThucHien_buocQuyTrinhId_fkey" FOREIGN KEY ("buocQuyTrinhId") REFERENCES "BuocQuyTrinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuNguoiThucHien" ADD CONSTRAINT "NhiemVuNguoiThucHien_nguoiGiaoId_fkey" FOREIGN KEY ("nguoiGiaoId") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_nhiemVuId_fkey" FOREIGN KEY ("nhiemVuId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_boPhanGiaoId_fkey" FOREIGN KEY ("boPhanGiaoId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_boPhanNhanId_fkey" FOREIGN KEY ("boPhanNhanId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_boPhanDuyetId_fkey" FOREIGN KEY ("boPhanDuyetId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_nguoiYeuCauId_fkey" FOREIGN KEY ("nguoiYeuCauId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PheDuyetNhiemVu" ADD CONSTRAINT "PheDuyetNhiemVu_nguoiDuyetId_fkey" FOREIGN KEY ("nguoiDuyetId") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DauRaNhiemVu" ADD CONSTRAINT "DauRaNhiemVu_nhiemVuId_fkey" FOREIGN KEY ("nhiemVuId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinhChung" ADD CONSTRAINT "MinhChung_dauRaId_fkey" FOREIGN KEY ("dauRaId") REFERENCES "DauRaNhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinhChung" ADD CONSTRAINT "MinhChung_tepTinId_fkey" FOREIGN KEY ("tepTinId") REFERENCES "TepTin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinhChung" ADD CONSTRAINT "MinhChung_nguoiNopId_fkey" FOREIGN KEY ("nguoiNopId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinhChung" ADD CONSTRAINT "MinhChung_nguoiDuyetId_fkey" FOREIGN KEY ("nguoiDuyetId") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuyTrinh" ADD CONSTRAINT "QuyTrinh_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuocQuyTrinh" ADD CONSTRAINT "BuocQuyTrinh_quyTrinhId_fkey" FOREIGN KEY ("quyTrinhId") REFERENCES "QuyTrinh"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChuyenBuoc" ADD CONSTRAINT "ChuyenBuoc_quyTrinhId_fkey" FOREIGN KEY ("quyTrinhId") REFERENCES "QuyTrinh"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChuyenBuoc" ADD CONSTRAINT "ChuyenBuoc_tuBuocId_fkey" FOREIGN KEY ("tuBuocId") REFERENCES "BuocQuyTrinh"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChuyenBuoc" ADD CONSTRAINT "ChuyenBuoc_denBuocId_fkey" FOREIGN KEY ("denBuocId") REFERENCES "BuocQuyTrinh"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MucTieu" ADD CONSTRAINT "MucTieu_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KetQuaChinh" ADD CONSTRAINT "KetQuaChinh_mucTieuId_fkey" FOREIGN KEY ("mucTieuId") REFERENCES "MucTieu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuKetQuaChinh" ADD CONSTRAINT "NhiemVuKetQuaChinh_nhiemVuId_fkey" FOREIGN KEY ("nhiemVuId") REFERENCES "NhiemVu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhiemVuKetQuaChinh" ADD CONSTRAINT "NhiemVuKetQuaChinh_ketQuaChinhId_fkey" FOREIGN KEY ("ketQuaChinhId") REFERENCES "KetQuaChinh"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiSo" ADD CONSTRAINT "ChiSo_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongThuc" ADD CONSTRAINT "CongThuc_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaTriChiSo" ADD CONSTRAINT "GiaTriChiSo_nhiemVuId_nguoiDungId_fkey" FOREIGN KEY ("nhiemVuId", "nguoiDungId") REFERENCES "NhiemVuNguoiThucHien"("nhiemVuId", "nguoiDungId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaTriChiSo" ADD CONSTRAINT "GiaTriChiSo_chiSoId_fkey" FOREIGN KEY ("chiSoId") REFERENCES "ChiSo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiChot" ADD CONSTRAINT "KpiChot_nhiemVuId_nguoiDungId_fkey" FOREIGN KEY ("nhiemVuId", "nguoiDungId") REFERENCES "NhiemVuNguoiThucHien"("nhiemVuId", "nguoiDungId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CauHinhKyBoPhan" ADD CONSTRAINT "CauHinhKyBoPhan_kyId_fkey" FOREIGN KEY ("kyId") REFERENCES "KyDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CauHinhKyBoPhan" ADD CONSTRAINT "CauHinhKyBoPhan_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CauHinhKyBoPhan" ADD CONSTRAINT "CauHinhKyBoPhan_congThucKyId_fkey" FOREIGN KEY ("congThucKyId") REFERENCES "CongThuc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieuChiDanhGia" ADD CONSTRAINT "TieuChiDanhGia_kyId_fkey" FOREIGN KEY ("kyId") REFERENCES "KyDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieuChiDanhGia" ADD CONSTRAINT "TieuChiDanhGia_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieuChiDanhGia" ADD CONSTRAINT "TieuChiDanhGia_tieuChiChaId_fkey" FOREIGN KEY ("tieuChiChaId") REFERENCES "TieuChiDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuyTacXepLoai" ADD CONSTRAINT "QuyTacXepLoai_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuDanhGia" ADD CONSTRAINT "PhieuDanhGia_kyId_fkey" FOREIGN KEY ("kyId") REFERENCES "KyDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuDanhGia" ADD CONSTRAINT "PhieuDanhGia_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuDanhGia" ADD CONSTRAINT "PhieuDanhGia_boPhanId_fkey" FOREIGN KEY ("boPhanId") REFERENCES "BoPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuDanhGia" ADD CONSTRAINT "PhieuDanhGia_nguoiXacNhanId_fkey" FOREIGN KEY ("nguoiXacNhanId") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KetQuaTuDanhGia" ADD CONSTRAINT "KetQuaTuDanhGia_phieuId_fkey" FOREIGN KEY ("phieuId") REFERENCES "PhieuDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KetQuaTuDanhGia" ADD CONSTRAINT "KetQuaTuDanhGia_tieuChiId_fkey" FOREIGN KEY ("tieuChiId") REFERENCES "TieuChiDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NguoiChamPhieu" ADD CONSTRAINT "NguoiChamPhieu_phieuId_fkey" FOREIGN KEY ("phieuId") REFERENCES "PhieuDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NguoiChamPhieu" ADD CONSTRAINT "NguoiChamPhieu_nguoiChamId_fkey" FOREIGN KEY ("nguoiChamId") REFERENCES "NguoiDung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemChamTieuChi" ADD CONSTRAINT "DiemChamTieuChi_nguoiChamPhieuId_fkey" FOREIGN KEY ("nguoiChamPhieuId") REFERENCES "NguoiChamPhieu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemChamTieuChi" ADD CONSTRAINT "DiemChamTieuChi_tieuChiId_fkey" FOREIGN KEY ("tieuChiId") REFERENCES "TieuChiDanhGia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThongBao" ADD CONSTRAINT "ThongBao_nguoiNhanId_fkey" FOREIGN KEY ("nguoiNhanId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhienNhapExcel" ADD CONSTRAINT "PhienNhapExcel_nguoiTaoId_fkey" FOREIGN KEY ("nguoiTaoId") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
