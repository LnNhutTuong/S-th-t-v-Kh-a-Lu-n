"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Users,
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MOCK_TASKS } from "@/constants/landing-data";

export default function HeroSection() {
  const [isTasksLoading, setIsTasksLoading] = useState(true);

  useEffect(() => {
    // Giả lập thời gian tải dữ liệu cho Product Preview
    const timer = setTimeout(() => setIsTasksLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="overview"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50/50"
    >
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-slate-200/40 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-[11px] font-semibold tracking-widest uppercase mb-6">
              <GraduationCap size={16} className="text-blue-900" />
              Trường Đại học An Giang
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Quản lý công việc,
              <br className="hidden md:block" />
              <span className="text-blue-900">kết nối hiệu quả.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Nền tảng hỗ trợ quản lý nhiệm vụ, theo dõi tiến độ và tăng cường
              phối hợp công tác giữa các đơn vị trong môi trường đại học.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto shadow-md"
                onClick={() => alert("Chuyển hướng đến Đăng nhập")}
              >
                Đăng nhập hệ thống <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white w-full sm:w-auto"
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Khám phá hệ thống
              </Button>
            </div>
          </motion.div>

          {/* Product Preview (Visual) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative lg:ml-auto w-full max-w-[600px] aspect-auto"
          >
            <Card className="relative bg-white shadow-2xl shadow-slate-200/60 border-slate-200 overflow-hidden flex flex-col w-full h-[400px] md:h-[480px]">
              {/* Mock App Header */}
              <div className="h-12 border-b border-slate-100 flex items-center px-4 justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="h-4 w-32 bg-slate-200 rounded-sm ml-2"></div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Search size={16} />
                  <Bell size={16} />
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-[10px] font-bold">
                    GV
                  </div>
                </div>
              </div>

              {/* Mock App Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Mock Sidebar */}
                <div className="w-14 md:w-48 border-r border-slate-100 bg-slate-50/40 flex flex-col p-3 gap-2">
                  <div className="h-9 rounded-md flex items-center gap-2 px-2 bg-blue-50 text-blue-700 cursor-pointer">
                    <LayoutDashboard size={18} />
                    <span className="hidden md:block text-xs font-medium">Tổng quan</span>
                  </div>
                  <div className="h-9 rounded-md flex items-center gap-2 px-2 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
                    <ClipboardList size={18} />
                    <span className="hidden md:block text-xs font-medium">Nhiệm vụ</span>
                  </div>
                  <div className="h-9 rounded-md flex items-center gap-2 px-2 text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
                    <CalendarDays size={18} />
                    <span className="hidden md:block text-xs font-medium">Lịch làm việc</span>
                  </div>
                </div>

                {/* Mock Main Content */}
                <div className="flex-1 p-4 md:p-6 bg-white overflow-hidden flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                        Công việc cần xử lý
                      </h3>
                      <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                        Tuần 42 • Học kỳ I
                      </p>
                    </div>
                    <Button size="sm" className="hidden md:flex h-8 text-xs bg-blue-900 shadow-sm">
                      Thêm mới
                    </Button>
                  </div>

                  {/* Task List */}
                  <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                    {isTasksLoading
                      ? Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={`skeleton-${index}`}
                            className="p-3 border border-slate-100 rounded-lg bg-slate-50/30 flex items-start sm:items-center gap-3"
                          >
                            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2.5 py-0.5">
                              <Skeleton className="h-4 w-3/4 sm:w-2/3" />
                              <div className="flex gap-2">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-3.5 w-20 hidden sm:block" />
                              </div>
                            </div>
                            <div className="hidden md:block shrink-0">
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                          </div>
                        ))
                      : MOCK_TASKS.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex items-start sm:items-center gap-3 hover:border-slate-200 transition-colors cursor-default"
                          >
                            <div className="mt-1 sm:mt-0">
                              {task.status === "completed" ? (
                                <CheckCircle size={18} className="text-emerald-500" />
                              ) : task.status === "overdue" ? (
                                <AlertCircle size={18} className="text-red-500" />
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium truncate",
                                  task.status === "completed" && "text-slate-500 line-through"
                                )}
                              >
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                  <Users size={10} /> {task.assignee}
                                </span>
                                <span className="hidden sm:inline text-slate-300">•</span>
                                <span className="flex items-center gap-1">
                                  <CalendarDays size={10} /> {task.date}
                                </span>
                              </div>
                            </div>
                            <div className="hidden md:block shrink-0">
                              {task.status === "completed" && <Badge variant="success">Hoàn thành</Badge>}
                              {task.status === "in-progress" && <Badge variant="default">Đang xử lý</Badge>}
                              {task.status === "pending" && <Badge variant="secondary">Chưa bắt đầu</Badge>}
                              {task.status === "overdue" && <Badge variant="destructive">Quá hạn</Badge>}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
