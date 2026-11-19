import {
  ClipboardList,
  FolderKanban,
  Users,
  Target,
  FileChartColumn,
  ChartNoAxesCombined,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Tổng quan", href: "#overview" },
  { label: "Giới thiệu", href: "#about" },
  { label: "Chức năng", href: "#features" },
  { label: "Quy trình", href: "#workflow" },
];

export const FEATURES = [
  {
    title: "Quản lý công việc",
    description:
      "Tạo, phân công và theo dõi tiến độ thực hiện nhiệm vụ chi tiết.",
    icon: ClipboardList,
  },
  {
    title: "Quản lý dự án",
    description:
      "Tập hợp các nhiệm vụ có liên quan và theo dõi tiến độ chung của toàn dự án.",
    icon: FolderKanban,
  },
  {
    title: "Phối hợp đơn vị",
    description:
      "Hỗ trợ tổ chức công việc theo nhóm hoặc đơn vị phù hợp với mô hình quản trị.",
    icon: Users,
  },
  {
    title: "Theo dõi tiến độ",
    description:
      "Quan sát trực quan trạng thái công việc và các thời hạn quan trọng.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Đánh giá OKR & KPI",
    description:
      "Hỗ trợ định hướng theo dõi mục tiêu và đánh giá kết quả thực hiện.",
    icon: Target,
  },
  {
    title: "Báo cáo và tổng hợp",
    description:
      "Theo dõi và tổng hợp thông tin công việc theo từng kỳ đánh giá.",
    icon: FileChartColumn,
    badge: "Đang phát triển",
  },
];

export const WORKFLOW_STEPS = [
  {
    title: "Tiếp nhận nhiệm vụ",
    description:
      "Nhận thông báo công việc mới kèm theo tài liệu và thời hạn rõ ràng.",
  },
  {
    title: "Thực hiện & Cập nhật",
    description:
      "Triển khai công việc và báo cáo tiến độ trực tiếp trên nền tảng.",
  },
  {
    title: "Phối hợp & Hoàn thành",
    description:
      "Trao đổi với các bộ phận liên quan và đánh dấu hoàn tất đúng hạn.",
  },
  {
    title: "Tổng hợp kết quả",
    description:
      "Dữ liệu tự động thống kê phục vụ cho báo cáo và đánh giá năng lực.",
  },
];

export const MOCK_TASKS = [
  { id: 1, title: "Hoàn thiện báo cáo công việc tháng", assignee: "Phòng Hành chính", status: "completed", date: "Hôm nay" },
  { id: 2, title: "Rà soát kế hoạch học kỳ I", assignee: "Phòng Đào tạo", status: "in-progress", date: "Ngày mai" },
  { id: 3, title: "Cập nhật tiến độ nhiệm vụ NCKH", assignee: "Phòng QLKH", status: "pending", date: "24/10/2026" },
  { id: 4, title: "Chuẩn bị tài liệu họp Giao ban", assignee: "Văn phòng Trường", status: "overdue", date: "Hôm qua" },
];
