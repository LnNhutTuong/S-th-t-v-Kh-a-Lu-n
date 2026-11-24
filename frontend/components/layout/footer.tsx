import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-blue-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                AGU
              </div>
              <span className="font-bold text-slate-900 tracking-tight">
                Quản trị công việc
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Hệ thống quản lý công việc và phối hợp nội bộ dành cho cán bộ,
              giảng viên và các đơn vị trực thuộc Trường Đại học An Giang.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">
              Hệ thống
            </h4>
            <ul className="space-y-3">
              <li><a href="#overview" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Tổng quan</a></li>
              <li><a href="#features" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Chức năng</a></li>
              <li><a href="#workflow" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Quy trình</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Tài liệu tham khảo</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-900 transition-colors">Liên hệ kỹ thuật</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} Hệ thống quản trị công việc. Phục vụ
            công tác quản lý và phối hợp nội bộ.
          </p>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-300" />
            Phát triển cho Trường Đại học An Giang
          </div>
        </div>
      </div>
    </footer>
  );
}
