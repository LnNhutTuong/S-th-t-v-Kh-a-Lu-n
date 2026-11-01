import { CapBac, LoaiBoPhan } from '../../generated/prisma/enums.js';

// ==============================================================================
// QUYỀN HẠN VÀ VAI TRÒ (thay cho pemission.constants.ts cũ)
// Dùng chung cho seed (prisma/seed.ts) và guard/decorator (@RequirePermission(QUYEN.xxx)).
// Bộ quyền gán cho từng vai trò dưới đây chỉ là BỘ KHỞI ĐẦU, ADMIN chỉnh được qua giao diện.
// ==============================================================================

const d = <T extends string>(ma: T, moTa: string) => ({ ma, moTa }) as const;

export const DINH_NGHIA_QUYEN = {
  // ─── Người dùng, bộ phận, thành viên ─────────────
  NGUOI_DUNG_XEM: d('nguoi_dung.xem', 'Xem danh sách người dùng'),
  NGUOI_DUNG_TAO: d('nguoi_dung.tao', 'Tạo người dùng'),
  NGUOI_DUNG_SUA: d('nguoi_dung.sua', 'Sửa thông tin người dùng'),
  NGUOI_DUNG_XOA: d('nguoi_dung.xoa', 'Xóa (mềm) người dùng'),
  VAI_TRO_XEM: d('vai_tro.xem', 'Xem vai trò và quyền hạn'),
  VAI_TRO_QUAN_LY: d('vai_tro.quan_ly', 'Thêm, sửa vai trò và gán quyền cho vai trò'),
  BO_PHAN_XEM: d('bo_phan.xem', 'Xem cây bộ phận'),
  BO_PHAN_TAO: d('bo_phan.tao', 'Tạo bộ phận'),
  BO_PHAN_SUA: d('bo_phan.sua', 'Sửa bộ phận'),
  BO_PHAN_NGUNG: d('bo_phan.ngung', 'Ngưng hoạt động bộ phận'),
  THANH_VIEN_XEM: d('thanh_vien.xem', 'Xem thành viên bộ phận'),
  THANH_VIEN_QUAN_LY: d('thanh_vien.quan_ly', 'Thêm, sửa, kết thúc thành viên bộ phận'),

  // ─── Văn bản ─────────────────────────────────────
  VAN_BAN_XEM: d('van_ban.xem', 'Xem và tra cứu văn bản'),
  VAN_BAN_TAI_LEN: d('van_ban.tai_len', 'Tải văn bản lên'),
  VAN_BAN_CAP_NHAT: d('van_ban.cap_nhat', 'Sửa thông tin và trạng thái văn bản'),
  LOAI_VAN_BAN_QUAN_LY: d('loai_van_ban.quan_ly', 'Thêm, sửa, tắt loại văn bản'),

  // ─── OKR ─────────────────────────────────────────
  MUC_TIEU_XEM: d('muc_tieu.xem', 'Xem mục tiêu'),
  MUC_TIEU_TAO: d('muc_tieu.tao', 'Tạo mục tiêu'),
  MUC_TIEU_SUA: d('muc_tieu.sua', 'Sửa mục tiêu'),
  MUC_TIEU_XOA: d('muc_tieu.xoa', 'Xóa mục tiêu'),
  KET_QUA_CHINH_XEM: d('ket_qua_chinh.xem', 'Xem kết quả chính'),
  KET_QUA_CHINH_TAO: d('ket_qua_chinh.tao', 'Tạo kết quả chính'),
  KET_QUA_CHINH_SUA: d('ket_qua_chinh.sua', 'Sửa kết quả chính'),
  KET_QUA_CHINH_XOA: d('ket_qua_chinh.xoa', 'Xóa kết quả chính'),

  // ─── Nhiệm vụ ────────────────────────────────────
  NHIEM_VU_XEM: d('nhiem_vu.xem', 'Xem nhiệm vụ'),
  NHIEM_VU_TAO: d('nhiem_vu.tao', 'Tạo nhiệm vụ'),
  NHIEM_VU_SUA: d('nhiem_vu.sua', 'Sửa nhiệm vụ'),
  NHIEM_VU_XOA: d('nhiem_vu.xoa', 'Xóa (mềm) nhiệm vụ'),
  NHIEM_VU_GIAO: d('nhiem_vu.giao', 'Giao nhiệm vụ nội bộ và giao xuống'),
  NHIEM_VU_GIAO_NGANG: d('nhiem_vu.giao_ngang', 'Gửi yêu cầu giao nhiệm vụ ngang cấp'),
  NHIEM_VU_DANG_KY: d('nhiem_vu.dang_ky', 'Tự đăng ký nhiệm vụ'),
  NHIEM_VU_XAC_NHAN_DANG_KY: d('nhiem_vu.xac_nhan_dang_ky', 'Xác nhận nhiệm vụ tự đăng ký'),
  NHIEM_VU_DUYET_GIAO_NGANG: d('nhiem_vu.duyet_giao_ngang', 'Duyệt yêu cầu giao ngang ở bộ phận tổ tiên chung'),
  NHIEM_VU_NHAP_CHI_SO: d('nhiem_vu.nhap_chi_so', 'Nhập giá trị chỉ số của nhiệm vụ'),
  NHIEM_VU_LIEN_KET_OKR: d('nhiem_vu.lien_ket_okr', 'Liên kết nhiệm vụ với kết quả chính'),
  DAU_RA_XEM: d('dau_ra.xem', 'Xem đầu ra nhiệm vụ'),
  DAU_RA_TAO: d('dau_ra.tao', 'Tạo đầu ra nhiệm vụ'),
  DAU_RA_SUA: d('dau_ra.sua', 'Sửa đầu ra nhiệm vụ'),
  DAU_RA_XOA: d('dau_ra.xoa', 'Xóa đầu ra nhiệm vụ'),
  MINH_CHUNG_XEM: d('minh_chung.xem', 'Xem minh chứng'),
  MINH_CHUNG_NOP: d('minh_chung.nop', 'Nộp minh chứng'),
  MINH_CHUNG_SUA: d('minh_chung.sua', 'Sửa minh chứng của mình'),
  MINH_CHUNG_XOA: d('minh_chung.xoa', 'Xóa minh chứng của mình (chưa được chấp nhận)'),
  MINH_CHUNG_DUYET: d('minh_chung.duyet', 'Duyệt hoặc trả lại minh chứng'),

  // ─── Đề tài/đề án ────────────────────────────────
  DE_TAI_XEM: d('de_tai.xem', 'Xem đề tài/đề án'),
  DE_TAI_TAO: d('de_tai.tao', 'Tạo đề tài/đề án'),
  DE_TAI_SUA: d('de_tai.sua', 'Sửa đề tài/đề án'),
  DE_TAI_XOA: d('de_tai.xoa', 'Xóa (mềm) đề tài/đề án'),
  DE_TAI_KICH_HOAT: d('de_tai.kich_hoat', 'Kích hoạt đề tài/đề án'),
  DE_TAI_QUAN_LY_THANH_VIEN: d('de_tai.quan_ly_thanh_vien', 'Quản lý thành viên và bộ phận phối hợp của đề tài'),

  // ─── Quy trình trạng thái ────────────────────────
  QUY_TRINH_XEM: d('quy_trinh.xem', 'Xem quy trình trạng thái'),
  QUY_TRINH_TAO: d('quy_trinh.tao', 'Tạo quy trình hoặc bước'),
  QUY_TRINH_SUA: d('quy_trinh.sua', 'Sửa quy trình hoặc bước'),
  QUY_TRINH_XOA: d('quy_trinh.xoa', 'Xóa quy trình hoặc bước'),

  // ─── KPI ─────────────────────────────────────────
  CHI_SO_XEM: d('chi_so.xem', 'Xem chỉ số'),
  CHI_SO_TAO: d('chi_so.tao', 'Tạo chỉ số'),
  CHI_SO_SUA: d('chi_so.sua', 'Sửa chỉ số'),
  CHI_SO_XOA: d('chi_so.xoa', 'Xóa chỉ số'),
  CONG_THUC_XEM: d('cong_thuc.xem', 'Xem công thức'),
  CONG_THUC_TAO: d('cong_thuc.tao', 'Tạo công thức'),
  CONG_THUC_SUA: d('cong_thuc.sua', 'Sửa công thức'),
  CONG_THUC_XOA: d('cong_thuc.xoa', 'Xóa công thức'),
  KPI_XEM: d('kpi.xem', 'Xem KPI'),
  KPI_TINH: d('kpi.tinh', 'Tính và chốt KPI'),

  // ─── Đánh giá ────────────────────────────────────
  KY_DANH_GIA_XEM: d('ky_danh_gia.xem', 'Xem kỳ đánh giá'),
  KY_DANH_GIA_TAO: d('ky_danh_gia.tao', 'Tạo kỳ đánh giá'),
  KY_DANH_GIA_SUA: d('ky_danh_gia.sua', 'Sửa kỳ đánh giá'),
  KY_DANH_GIA_XOA: d('ky_danh_gia.xoa', 'Xóa kỳ đánh giá'),
  CAU_HINH_KY_QUAN_LY: d('cau_hinh_ky.quan_ly', 'Cấu hình tỷ trọng và công thức kỳ theo bộ phận'),
  TIEU_CHI_XEM: d('tieu_chi.xem', 'Xem tiêu chí đánh giá'),
  TIEU_CHI_QUAN_LY: d('tieu_chi.quan_ly', 'Thêm, sửa, xóa tiêu chí đánh giá'),
  XEP_LOAI_XEM: d('xep_loai.xem', 'Xem quy tắc xếp loại'),
  XEP_LOAI_QUAN_LY: d('xep_loai.quan_ly', 'Thêm, sửa, xóa quy tắc xếp loại'),
  PHIEU_XEM_CUA_MINH: d('phieu.xem_cua_minh', 'Xem phiếu đánh giá của chính mình'),
  PHIEU_XEM_TAT_CA: d('phieu.xem_tat_ca', 'Xem phiếu đánh giá của người khác trong bộ phận'),
  PHIEU_TU_DANH_GIA: d('phieu.tu_danh_gia', 'Tự đánh giá và nộp phiếu của mình'),
  PHIEU_CHAM: d('phieu.cham', 'Chấm phiếu của người được gán làm người chấm'),
  PHIEU_XAC_NHAN: d('phieu.xac_nhan', 'Xác nhận cuối phiếu được gán'),

  // ─── Excel và AI ─────────────────────────────────
  EXCEL_XUAT: d('excel.xuat', 'Xuất Excel (mẫu và dữ liệu)'),
  EXCEL_NHAP_BO_PHAN: d('excel.nhap_bo_phan', 'Nhập bộ phận từ Excel'),
  EXCEL_NHAP_NGUOI_DUNG: d('excel.nhap_nguoi_dung', 'Nhập người dùng và thành viên từ Excel'),
  EXCEL_NHAP_NHIEM_VU: d('excel.nhap_nhiem_vu', 'Nhập nhiệm vụ từ Excel'),
  EXCEL_NHAP_DE_TAI: d('excel.nhap_de_tai', 'Nhập đề tài/đề án từ Excel'),
  AI_GOI_Y: d('ai.goi_y', 'Dùng AI gợi ý tạo nhiệm vụ hoặc đề tài'),
} as const;

type DinhNghia = typeof DINH_NGHIA_QUYEN;

// Dùng trong code: @RequirePermission(QUYEN.NHIEM_VU_TAO) -> 'nhiem_vu.tao'
export const QUYEN = Object.fromEntries(
  Object.entries(DINH_NGHIA_QUYEN).map(([khoa, v]) => [khoa, v.ma]),
) as { [K in keyof DinhNghia]: DinhNghia[K]['ma'] };

export type MaQuyen = (typeof QUYEN)[keyof typeof QUYEN];

const Q = QUYEN;

// ─── Bộ quyền khởi đầu theo cấp bậc (cộng dồn: THANH_VIEN < PHO < TRUONG) ─────────
// Quyền thao tác trên đối tượng "của mình" (sửa việc được giao, nộp minh chứng...) vẫn phải
// được service kiểm tra thêm quyền sở hữu.

const QUYEN_THANH_VIEN: MaQuyen[] = [
  Q.BO_PHAN_XEM, Q.THANH_VIEN_XEM, Q.VAN_BAN_XEM,
  Q.MUC_TIEU_XEM, Q.KET_QUA_CHINH_XEM,
  Q.NHIEM_VU_XEM, Q.NHIEM_VU_DANG_KY,
  Q.DAU_RA_XEM, Q.DAU_RA_TAO, Q.DAU_RA_SUA,
  Q.MINH_CHUNG_XEM, Q.MINH_CHUNG_NOP, Q.MINH_CHUNG_SUA, Q.MINH_CHUNG_XOA,
  Q.DE_TAI_XEM, Q.QUY_TRINH_XEM, Q.CHI_SO_XEM, Q.CONG_THUC_XEM, Q.KPI_XEM,
  Q.KY_DANH_GIA_XEM, Q.TIEU_CHI_XEM, Q.XEP_LOAI_XEM,
  Q.PHIEU_XEM_CUA_MINH, Q.PHIEU_TU_DANH_GIA,
  Q.EXCEL_XUAT, Q.AI_GOI_Y,
];

const QUYEN_PHO_THEM: MaQuyen[] = [
  Q.NHIEM_VU_TAO, Q.NHIEM_VU_SUA, Q.NHIEM_VU_GIAO, Q.NHIEM_VU_NHAP_CHI_SO, Q.NHIEM_VU_LIEN_KET_OKR,
  Q.DAU_RA_XOA, Q.MINH_CHUNG_DUYET, Q.KPI_TINH,
  Q.PHIEU_XEM_TAT_CA, Q.PHIEU_CHAM,
];

const QUYEN_TRUONG_THEM: MaQuyen[] = [
  Q.NHIEM_VU_XOA, Q.NHIEM_VU_GIAO_NGANG, Q.NHIEM_VU_XAC_NHAN_DANG_KY, Q.NHIEM_VU_DUYET_GIAO_NGANG,
  Q.VAN_BAN_TAI_LEN, Q.VAN_BAN_CAP_NHAT,
  Q.MUC_TIEU_TAO, Q.MUC_TIEU_SUA, Q.MUC_TIEU_XOA,
  Q.KET_QUA_CHINH_TAO, Q.KET_QUA_CHINH_SUA, Q.KET_QUA_CHINH_XOA,
  Q.DE_TAI_TAO, Q.DE_TAI_SUA, Q.DE_TAI_XOA, Q.DE_TAI_KICH_HOAT, Q.DE_TAI_QUAN_LY_THANH_VIEN,
  Q.QUY_TRINH_TAO, Q.QUY_TRINH_SUA, Q.QUY_TRINH_XOA,
  Q.CHI_SO_TAO, Q.CHI_SO_SUA, Q.CHI_SO_XOA,
  Q.CONG_THUC_TAO, Q.CONG_THUC_SUA, Q.CONG_THUC_XOA,
  Q.CAU_HINH_KY_QUAN_LY, Q.TIEU_CHI_QUAN_LY, Q.XEP_LOAI_QUAN_LY,
  Q.PHIEU_XAC_NHAN,
  Q.EXCEL_NHAP_NHIEM_VU, Q.EXCEL_NHAP_DE_TAI,
];

export const QUYEN_THEO_CAP_BAC: Record<CapBac, MaQuyen[]> = {
  THANH_VIEN: QUYEN_THANH_VIEN,
  PHO: [...QUYEN_THANH_VIEN, ...QUYEN_PHO_THEM],
  TRUONG: [...QUYEN_THANH_VIEN, ...QUYEN_PHO_THEM, ...QUYEN_TRUONG_THEM],
};

// ─── Vai trò ──────────────────────────────────────────────────────────────────

export const MA_VAI_TRO_ADMIN = 'ADMIN';

export type DinhNghiaVaiTroBoPhan = {
  ma: string;
  ten: string; // chính là chức vụ hiển thị
  loaiBoPhan: LoaiBoPhan;
  capBac: CapBac;
  soLuongToiDa: number | null; // null = không giới hạn
};

// Vai trò KHÔNG dùng chung giữa các loại bộ phận. Thư viện và Trường phổ thông chưa có
// danh mục chức vụ nên chưa có ở đây; thêm sau bằng cách thêm vai trò và bộ phận.
export const VAI_TRO_BO_PHAN: DinhNghiaVaiTroBoPhan[] = [
  // Ban Giám hiệu (không có vai trò thành viên)
  { ma: 'HIEU_TRUONG', ten: 'Hiệu trưởng', loaiBoPhan: 'BAN_GIAM_HIEU', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_HIEU_TRUONG', ten: 'Phó Hiệu trưởng', loaiBoPhan: 'BAN_GIAM_HIEU', capBac: 'PHO', soLuongToiDa: 2 },
  // Khoa
  { ma: 'TRUONG_KHOA', ten: 'Trưởng khoa', loaiBoPhan: 'KHOA', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_KHOA', ten: 'Phó khoa', loaiBoPhan: 'KHOA', capBac: 'PHO', soLuongToiDa: 1 },
  { ma: 'GIANG_VIEN_KHOA', ten: 'Giảng viên', loaiBoPhan: 'KHOA', capBac: 'THANH_VIEN', soLuongToiDa: null },
  // Bộ môn
  { ma: 'TRUONG_BO_MON', ten: 'Trưởng bộ môn', loaiBoPhan: 'BO_MON', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_BO_MON', ten: 'Phó bộ môn', loaiBoPhan: 'BO_MON', capBac: 'PHO', soLuongToiDa: 1 },
  { ma: 'GIANG_VIEN_BO_MON', ten: 'Giảng viên', loaiBoPhan: 'BO_MON', capBac: 'THANH_VIEN', soLuongToiDa: null },
  // Phòng
  { ma: 'TRUONG_PHONG', ten: 'Trưởng phòng', loaiBoPhan: 'PHONG', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_PHONG', ten: 'Phó phòng', loaiBoPhan: 'PHONG', capBac: 'PHO', soLuongToiDa: 1 },
  { ma: 'NHAN_VIEN_PHONG', ten: 'Nhân viên', loaiBoPhan: 'PHONG', capBac: 'THANH_VIEN', soLuongToiDa: null },
  // Viện
  { ma: 'TRUONG_VIEN', ten: 'Trưởng viện', loaiBoPhan: 'VIEN', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_VIEN', ten: 'Phó viện', loaiBoPhan: 'VIEN', capBac: 'PHO', soLuongToiDa: 1 },
  { ma: 'NHAN_VIEN_VIEN', ten: 'Nhân viên', loaiBoPhan: 'VIEN', capBac: 'THANH_VIEN', soLuongToiDa: null },
  // Trung tâm
  { ma: 'TRUONG_TRUNG_TAM', ten: 'Trưởng trung tâm', loaiBoPhan: 'TRUNG_TAM', capBac: 'TRUONG', soLuongToiDa: 1 },
  { ma: 'PHO_TRUNG_TAM', ten: 'Phó trung tâm', loaiBoPhan: 'TRUNG_TAM', capBac: 'PHO', soLuongToiDa: 1 },
  { ma: 'NHAN_VIEN_TRUNG_TAM', ten: 'Nhân viên', loaiBoPhan: 'TRUNG_TAM', capBac: 'THANH_VIEN', soLuongToiDa: null },
];

// Vai trò trong phạm vi đề tài/đề án (không thuộc loại bộ phận nào).
export const VAI_TRO_DE_TAI: { ma: string; ten: string; quyen: MaQuyen[] }[] = [
  {
    ma: 'CHU_NHIEM',
    ten: 'Chủ nhiệm',
    quyen: [
      Q.DE_TAI_XEM, Q.DE_TAI_SUA, Q.DE_TAI_QUAN_LY_THANH_VIEN,
      Q.NHIEM_VU_XEM, Q.NHIEM_VU_TAO, Q.NHIEM_VU_SUA, Q.MINH_CHUNG_DUYET, Q.VAN_BAN_XEM,
    ],
  },
  {
    ma: 'THANH_VIEN_DE_TAI',
    ten: 'Thành viên đề tài',
    quyen: [Q.DE_TAI_XEM, Q.NHIEM_VU_XEM, Q.VAN_BAN_XEM],
  },
];

// ─── Loại văn bản ban đầu (người có thẩm quyền thêm bớt sau qua giao diện) ──────

export const LOAI_VAN_BAN_BAN_DAU: { ma: string; ten: string }[] = [
  { ma: 'NGHI_QUYET', ten: 'Nghị quyết' },
  { ma: 'NGHI_DINH', ten: 'Nghị định' },
  { ma: 'THONG_TU', ten: 'Thông tư' },
  { ma: 'QUYET_DINH', ten: 'Quyết định' },
  { ma: 'QUY_CHE', ten: 'Quy chế, quy định' },
  { ma: 'KE_HOACH', ten: 'Kế hoạch' },
  { ma: 'CONG_VAN', ten: 'Công văn' },
  { ma: 'THONG_BAO', ten: 'Thông báo' },
  { ma: 'HUONG_DAN', ten: 'Hướng dẫn' },
  { ma: 'TO_TRINH', ten: 'Tờ trình' },
  { ma: 'BAO_CAO', ten: 'Báo cáo' },
  { ma: 'BIEN_BAN', ten: 'Biên bản' },
  { ma: 'KHAC', ten: 'Khác' },
];