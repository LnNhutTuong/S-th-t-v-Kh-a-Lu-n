import { WORKFLOW_STEPS } from "@/constants/landing-data";

export default function WorkflowSection() {
  return (
    <section id="workflow" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Từ nhiệm vụ đến kết quả
          </h2>
          <p className="text-slate-600 text-lg">
            Quy trình làm việc được chuẩn hóa giúp mọi cá nhân và đơn vị nắm bắt
            luồng công tác một cách liền mạch, từ khi tiếp nhận đến lúc hoàn
            thành.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Timeline connecting line (desktop) */}
          <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-slate-100 z-0"></div>

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {WORKFLOW_STEPS.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Mobile timeline line */}
                {index !== WORKFLOW_STEPS.length - 1 && (
                  <div className="md:hidden absolute top-14 left-1/2 bottom-[-2rem] w-0.5 bg-slate-100 -translate-x-1/2 z-0"></div>
                )}

                <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center font-bold text-slate-900 text-xl relative z-10 mb-6 group-hover:border-blue-100 group-hover:bg-blue-900 group-hover:text-white transition-all duration-300">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
