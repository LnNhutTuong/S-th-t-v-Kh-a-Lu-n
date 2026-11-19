import { BookOpen, CheckCircle } from "lucide-react";

const ABOUT_POINTS = [
  "Chuẩn hóa quy trình giao nhận việc giữa các phòng ban.",
  "Lưu trữ và truy xuất tài liệu đính kèm tập trung, bảo mật.",
  "Giảm thiểu trao đổi qua các kênh không chính thức, tránh trôi lấp thông tin.",
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-[4/3] rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shadow-sm">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center text-slate-400 gap-4 bg-white/80 p-8 rounded-2xl backdrop-blur-sm border border-slate-100 shadow-sm">
                <BookOpen size={56} className="text-blue-900" />
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-600">
                  Không gian học thuật số
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Một không gian làm việc thống nhất
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Hệ thống quản trị công việc Trường Đại học An Giang được xây dựng
              hướng đến việc tập trung hóa thông tin, hỗ trợ theo dõi tiến độ
              một cách khoa học và giúp các đơn vị phối hợp thuận tiện hơn trong
              các hoạt động thường nhật.
            </p>
            <ul className="space-y-4 mt-8">
              {ABOUT_POINTS.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle size={20} className="text-blue-900 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
