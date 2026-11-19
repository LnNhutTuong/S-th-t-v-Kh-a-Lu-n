import { Activity, Users, ShieldCheck } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Activity,
    title: "Minh bạch tiến độ",
    description:
      "Dễ dàng theo dõi trạng thái và thời hạn của các nhiệm vụ một cách trực quan, chính xác.",
  },
  {
    icon: Users,
    title: "Phối hợp hiệu quả",
    description:
      "Hỗ trợ kết nối công việc chặt chẽ giữa các cá nhân, nhóm làm việc và các đơn vị.",
  },
  {
    icon: ShieldCheck,
    title: "Rõ ràng trách nhiệm",
    description:
      "Giúp cán bộ, giảng viên nắm bắt chính xác nhiệm vụ được giao và cam kết thực hiện.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
