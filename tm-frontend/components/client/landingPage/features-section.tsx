"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FEATURES } from "@/constants/landing-data";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Các công cụ hỗ trợ công việc
          </h2>
          <p className="text-slate-600 text-lg">
            Những nhóm chức năng được định hướng thiết kế nhằm hỗ trợ tối đa việc
            tổ chức, theo dõi và đánh giá công việc trong môi trường đại học.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 md:p-8 hover:shadow-lg transition-all duration-300 border-slate-200 bg-white group cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-6 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-md">
                    <Icon size={28} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600"
                      >
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
