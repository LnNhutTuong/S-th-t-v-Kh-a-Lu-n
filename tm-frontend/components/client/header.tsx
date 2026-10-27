"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/constants/landing-data";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    alert("Chuyển hướng đến trang đăng nhập hệ thống...");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm py-3"
          : "bg-white border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            AGU
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-900 leading-tight tracking-tight">
              Quản trị công việc
            </h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Hệ thống nội bộ
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-slate-600">
            Hỗ trợ
          </Button>
          <Button onClick={handleLoginClick}>Đăng nhập</Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden shadow-lg absolute w-full"
          >
            <div className="flex flex-col p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-700 py-3 px-2 rounded-md hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-center">
                  Hỗ trợ
                </Button>
                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLoginClick();
                  }}
                >
                  Đăng nhập hệ thống
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
