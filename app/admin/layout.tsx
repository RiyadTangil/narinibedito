"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Store, 
  LogOut, 
  ShieldCheck,
  User,
  Layers,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      title: "ড্যাশবোর্ড ওভারভিউ",
      subTitle: "Overview & Analytics",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      title: "সকল পণ্য",
      subTitle: "Products Catalog",
      href: "/admin/products",
      icon: Package,
      active: pathname === "/admin/products",
    },
    {
      title: "নতুন পণ্য যোগ",
      subTitle: "Add New Product",
      href: "/admin/products/add",
      icon: PlusCircle,
      active: pathname === "/admin/products/add" || pathname === "/admin/products/new",
      highlight: true,
    },
    {
      title: "কাস্টমার অর্ডারসমূহ",
      subTitle: "Customer Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/orders"),
    },
    {
      title: "ক্যাটাগরি ম্যানেজমেন্ট",
      subTitle: "Product Categories",
      href: "/admin/categories",
      icon: Layers,
      active: pathname === "/admin/categories",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden h-16 bg-[#50091D] text-white flex items-center justify-between px-4 border-b border-[#6B112B] shrink-0 sticky top-0 z-40">
        {/* Left: Hamburger Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-[#6B112B] h-9 w-9 rounded-xl -ml-1"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Right: Logo and Brand Text */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="font-extrabold text-sm tracking-tight font-serif">নারী নিবেদিত</span>
            <span className="text-[10px] text-[#F5E6B3]">এডমিন প্যানেল</span>
          </div>
          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#D4AF37] bg-white p-0.5 shrink-0">
            <Image
              src="/images/logo.jpg"
              alt="নারী নিবেদিত"
              fill
              className="object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Desktop & Mobile Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#1E040B] text-slate-200 flex flex-col shrink-0 border-r border-[#380714]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand Banner */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[#380714] bg-[#160308]">
          <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-white p-0.5 shrink-0 shadow-md">
            <Image
              src="/images/logo.jpg"
              alt="নারী নিবেদিত"
              fill
              className="object-contain rounded-full"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base leading-tight font-serif tracking-tight">
                নারী নিবেদিত
              </span>
              <Badge className="bg-[#D4AF37] text-[#4A0A1C] hover:bg-[#D4AF37] text-[9px] px-1.5 py-0 font-black rounded-md border-0">
                PRO
              </Badge>
            </div>
            <span className="text-[11px] text-[#F5E6B3] font-medium tracking-wide">
              ই-কমার্স কন্ট্রোল প্যানেল
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-rose-300/60 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#D4AF37]" />
            <span>ই-কমার্স ম্যানেজমেন্ট</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all group ${
                  item.active
                    ? "bg-gradient-to-r from-[#6B112B] to-[#881337] text-white shadow-lg shadow-rose-950/40 font-semibold border border-rose-400/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                    item.active 
                      ? "bg-white/20 text-[#F5E6B3]" 
                      : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold leading-tight">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.subTitle}</span>
                  </div>
                </div>

                {item.highlight && !item.active && (
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold px-1.5 py-0">
                    + যোগ
                  </Badge>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 py-2 text-[10px] font-bold text-rose-300/60 uppercase tracking-widest">
            কুইক এক্সেস
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-200 hover:bg-white/5 hover:text-white transition-all border border-rose-300/10"
          >
            <div className="flex items-center gap-2.5">
              <Store className="h-4 w-4 text-[#D4AF37]" />
              <span>লাইভ ওয়েবসাইট ভিজিট</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-[#380714] bg-[#160308]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#6B112B] to-[#D4AF37] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">
                {session?.user?.name || "এডমিন ইউজার"}
              </span>
              <span className="text-[10px] text-[#F5E6B3] truncate">
                {session?.user?.email || "narinibediti@gmail.com"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="লগআউট"
            className="text-slate-400 hover:text-red-400 hover:bg-white/5 h-8 w-8 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar for Desktop */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200/90 items-center justify-between px-6 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight font-serif">
              {navItems.find((n) => n.active)?.title || "এডমিন প্যানেল"}
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              নারীর সৌন্দর্য, রুচি ও ভালোবাসার বিশ্বস্ত ঠিকানা
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link href="/admin/categories">
              <Button size="sm" variant="outline" className="border-rose-200 text-[#6B112B] hover:bg-rose-50 rounded-xl h-9 text-xs font-bold gap-1.5 hidden sm:inline-flex">
                <Layers className="h-3.5 w-3.5" />
                <span>ক্যাটাগরি</span>
              </Button>
            </Link>

            <Link href="/admin/products/add">
              <Button size="sm" className="bg-[#6B112B] hover:bg-[#50091D] text-white rounded-xl h-9 text-xs font-bold gap-1.5 shadow-sm shadow-rose-950/20">
                <PlusCircle className="h-3.5 w-3.5 text-[#F5E6B3]" />
                <span>নতুন পণ্য যোগ</span>
              </Button>
            </Link>

            <Link href="/" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-xl h-9 text-xs font-semibold gap-1 hidden md:inline-flex">
                <Store className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>ওয়েবসাইট</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}