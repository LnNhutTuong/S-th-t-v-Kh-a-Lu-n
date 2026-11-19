"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 bg-blue-900 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="199.5" stroke="white" />
          <circle cx="200" cy="200" r="149.5" stroke="white" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="99.5" stroke="white" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
          Sẵn sàng bắt đầu công việc?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Truy cập hệ thống ngay để quản lý nhiệm vụ, cập nhật tiến độ và phối
          hợp công tác cùng các đơn vị trong Trường.
        </p>
        <Button
          size="lg"
          className="bg-white text-blue-900 hover:bg-slate-50 font-semibold px-8 h-12 rounded-md shadow-lg hover:shadow-xl transition-all"
          onClick={() => alert("Chuyển hướng đến Đăng nhập")}
        >
          Đăng nhập hệ thống <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </section>
  );
}
