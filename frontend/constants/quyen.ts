// ==============================================================================
// MÃ QUYỀN DÙNG Ở FRONTEND
// Chép từ backend: src/permission/constants/quyen-han.constants.ts (DINH_NGHIA_QUYEN).
// Backend thêm hoặc đổi mã quyền thì sửa file này cho khớp (84 mã).
//
// Lưu ý: frontend dùng quyền chỉ để ẩn/hiện menu và nút. Quyền thật do backend chặn (guard).
// Cách dùng: coQuyen(QUYEN.NHIEM_VU_TAO). Gõ sai tên hằng số thì TypeScript báo đỏ ngay.
// ==============================================================================

export const QUYEN = {
  // Người dùng, bộ phận, thành viên
  NGUOI_DUNG_XEM: "nguoi_dung.xem",
  NGUOI_DUNG_TAO: "nguoi_dung.tao",
  NGUOI_DUNG_SUA: "nguoi_dung.sua",
  NGUOI_DUNG_XOA: "nguoi_dung.xoa",
  VAI_TRO_XEM: "vai_tro.xem",
  VAI_TRO_QUAN_LY: "vai_tro.quan_ly",
  BO_PHAN_XEM: "bo_phan.xem",
  BO_PHAN_TAO: "bo_phan.tao",
  BO_PHAN_SUA: "bo_phan.sua",
  BO_PHAN_NGUNG: "bo_phan.ngung",
  THANH_VIEN_XEM: "thanh_vien.xem",
  THANH_VIEN_QUAN_LY: "thanh_vien.quan_ly",

  // Văn bản
  VAN_BAN_XEM: "van_ban.xem",
  VAN_BAN_TAI_LEN: "van_ban.tai_len",
  VAN_BAN_CAP_NHAT: "van_ban.cap_nhat",
  LOAI_VAN_BAN_QUAN_LY: "loai_van_ban.quan_ly",

  // OKR
  MUC_TIEU_XEM: "muc_tieu.xem",
  MUC_TIEU_TAO: "muc_tieu.tao",
  MUC_TIEU_SUA: "muc_tieu.sua",
  MUC_TIEU_XOA: "muc_tieu.xoa",
  KET_QUA_CHINH_XEM: "ket_qua_chinh.xem",
  KET_QUA_CHINH_TAO: "ket_qua_chinh.tao",
  KET_QUA_CHINH_SUA: "ket_qua_chinh.sua",
  KET_QUA_CHINH_XOA: "ket_qua_chinh.xoa",

  // Nhiệm vụ
  NHIEM_VU_XEM: "nhiem_vu.xem",
  NHIEM_VU_TAO: "nhiem_vu.tao",
  NHIEM_VU_SUA: "nhiem_vu.sua",
  NHIEM_VU_XOA: "nhiem_vu.xoa",
  NHIEM_VU_GIAO: "nhiem_vu.giao",
  NHIEM_VU_GIAO_NGANG: "nhiem_vu.giao_ngang",
  NHIEM_VU_DANG_KY: "nhiem_vu.dang_ky",
  NHIEM_VU_XAC_NHAN_DANG_KY: "nhiem_vu.xac_nhan_dang_ky",
  NHIEM_VU_DUYET_GIAO_NGANG: "nhiem_vu.duyet_giao_ngang",
  NHIEM_VU_NHAP_CHI_SO: "nhiem_vu.nhap_chi_so",
  NHIEM_VU_LIEN_KET_OKR: "nhiem_vu.lien_ket_okr",
  DAU_RA_XEM: "dau_ra.xem",
  DAU_RA_TAO: "dau_ra.tao",
  DAU_RA_SUA: "dau_ra.sua",
  DAU_RA_XOA: "dau_ra.xoa",
  MINH_CHUNG_XEM: "minh_chung.xem",
  MINH_CHUNG_NOP: "minh_chung.nop",
  MINH_CHUNG_SUA: "minh_chung.sua",
  MINH_CHUNG_XOA: "minh_chung.xoa",
  MINH_CHUNG_DUYET: "minh_chung.duyet",

  // Đề tài/đề án
  DE_TAI_XEM: "de_tai.xem",
  DE_TAI_TAO: "de_tai.tao",
  DE_TAI_SUA: "de_tai.sua",
  DE_TAI_XOA: "de_tai.xoa",
  DE_TAI_KICH_HOAT: "de_tai.kich_hoat",
  DE_TAI_QUAN_LY_THANH_VIEN: "de_tai.quan_ly_thanh_vien",

  // Quy trình trạng thái
  QUY_TRINH_XEM: "quy_trinh.xem",
  QUY_TRINH_TAO: "quy_trinh.tao",
  QUY_TRINH_SUA: "quy_trinh.sua",
  QUY_TRINH_XOA: "quy_trinh.xoa",

  // KPI
  CHI_SO_XEM: "chi_so.xem",
  CHI_SO_TAO: "chi_so.tao",
  CHI_SO_SUA: "chi_so.sua",
  CHI_SO_XOA: "chi_so.xoa",
  CONG_THUC_XEM: "cong_thuc.xem",
  CONG_THUC_TAO: "cong_thuc.tao",
  CONG_THUC_SUA: "cong_thuc.sua",
  CONG_THUC_XOA: "cong_thuc.xoa",
  KPI_XEM: "kpi.xem",
  KPI_TINH: "kpi.tinh",

  // Đánh giá
  KY_DANH_GIA_XEM: "ky_danh_gia.xem",
  KY_DANH_GIA_TAO: "ky_danh_gia.tao",
  KY_DANH_GIA_SUA: "ky_danh_gia.sua",
  KY_DANH_GIA_XOA: "ky_danh_gia.xoa",
  CAU_HINH_KY_QUAN_LY: "cau_hinh_ky.quan_ly",
  TIEU_CHI_XEM: "tieu_chi.xem",
  TIEU_CHI_QUAN_LY: "tieu_chi.quan_ly",
  XEP_LOAI_XEM: "xep_loai.xem",
  XEP_LOAI_QUAN_LY: "xep_loai.quan_ly",
  PHIEU_XEM_CUA_MINH: "phieu.xem_cua_minh",
  PHIEU_XEM_TAT_CA: "phieu.xem_tat_ca",
  PHIEU_TU_DANH_GIA: "phieu.tu_danh_gia",
  PHIEU_CHAM: "phieu.cham",
  PHIEU_XAC_NHAN: "phieu.xac_nhan",

  // Excel và AI
  EXCEL_XUAT: "excel.xuat",
  EXCEL_NHAP_BO_PHAN: "excel.nhap_bo_phan",
  EXCEL_NHAP_NGUOI_DUNG: "excel.nhap_nguoi_dung",
  EXCEL_NHAP_NHIEM_VU: "excel.nhap_nhiem_vu",
  EXCEL_NHAP_DE_TAI: "excel.nhap_de_tai",
  AI_GOI_Y: "ai.goi_y",
} as const;

// Kiểu chứa đúng 84 mã trên. Dùng cho tham số của hàm kiểm tra quyền.
export type MaQuyen = (typeof QUYEN)[keyof typeof QUYEN];