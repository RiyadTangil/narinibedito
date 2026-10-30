"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Search, 
  Phone, 
  LogOut, 
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Truck,
  User,
  Flame,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Do not render storefront header on admin or auth pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  // Primary navigation links integrated directly into the single navbar
  const navLinks = [
    { title: "হোম", href: "/" },
    { title: "চুড়ি আলনা", href: "/products?category=churi-alna", badge: "সেরা" },
    { title: "হোম মন্দির", href: "/products?category=home-decor" },
    { title: "চুড়ি ও গহনা", href: "/products?category=jewellery" },
    { title: "শোপিস ও লাইটিং", href: "/products?category=lighting" },
    { title: "সব পণ্য", href: "/products" },
  ];

  // Real form submit so the keyboard "Go/Search" key works on phones
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. SLIM TOP ANNOUNCEMENT BAR (scrolls away, not sticky)    */}
      {/* ========================================================= */}
      <div className="bg-[#5A0D22] text-rose-100 text-[11px] sm:text-xs py-1.5 px-4 border-b border-[#72122C]">
        <div className="container mx-auto px-0 flex items-center justify-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[#F5E6B3] font-semibold">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" /> সৌন্দর্য • রুচি • ভালোবাসা
            </span>
            <span className="hidden md:inline text-rose-300/40">|</span>
            {/* Mobile: one clear value proposition */}
            <span className="inline-flex items-center gap-1.5 text-rose-100 sm:hidden truncate">
              <Truck className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
              সারাদেশে ক্যাশ অন ডেলিভারি
              <span className="text-rose-300/50">•</span>
              <a href="tel:01614258804" className="font-semibold text-white">০১৬১৪-২৫৮৮০৪</a>
            </span>
            <span className="hidden md:inline text-rose-200">
              সারাদেশে ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-medium">
            <a 
              href="tel:01614258804" 
              className="flex items-center gap-1 text-white hover:text-[#F5E6B3] transition-colors"
            >
              <Phone className="h-3 w-3 text-[#D4AF37]" />
              <span className="font-semibold">০১৬১৪-২৫৮৮০৪</span>
            </a>
            <span className="text-rose-400/40">|</span>
            <a 
              href="https://wa.me/8801614258804" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-emerald-200 font-bold transition-colors flex items-center gap-1"
            >
              <MessageCircle className="h-3 w-3 fill-emerald-400" />
              <span>WhatsApp</span>
            </a>
            <span className="text-rose-400/40">|</span>
            <Link 
              href="/admin" 
              className="text-rose-300 hover:text-white text-[11px] transition-colors"
            >
              অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-100/80 transition-all">
        {/* ========================================================= */}
        {/* 2. SINGLE UNIFIED MODERN NAVBAR                           */}
        {/* Logo on Left, Nav Links in Center, Actions on Right       */}
        {/* ========================================================= */}
        <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-[68px] flex items-center justify-between gap-2 xl:gap-6 flex-nowrap">
          
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-[#D4AF37] p-0.5 bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/images/logo.jpg"
                alt="নারী নিবেদিত লোগো"
                fill
                sizes="48px"
                className="object-contain rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-[#6B112B] leading-none font-serif truncate">
                নারী নিবেদিত
              </span>
              <span className="text-[10px] font-semibold text-[#B8860B] tracking-wider mt-0.5 truncate">
                সৌন্দর্য • রুচি • ভালোবাসা
              </span>
            </div>
          </Link>

          {/* Center: Clean Modern Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 whitespace-nowrap shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    isActive 
                      ? "bg-[#6B112B] text-white shadow-sm" 
                      : "text-slate-700 hover:text-[#6B112B] hover:bg-rose-50"
                  }`}
                >
                  <span className="whitespace-nowrap">{link.title}</span>
                  {link.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-tight whitespace-nowrap ${
                      isActive ? "bg-[#D4AF37] text-[#4A0A1C]" : "bg-rose-100 text-[#6B112B]"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Hot Deal Pill */}
            <Link
              href="/products"
              className="flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-bold text-[#6B112B] bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors ml-0.5 whitespace-nowrap shrink-0"
            >
              <Flame className="h-3.5 w-3.5 text-rose-600 fill-rose-600 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">অফার</span>
            </Link>
          </nav>

          {/* Right: Actions (Search, WhatsApp Order, User, Menu) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 whitespace-nowrap">
            
            {/* Integrated Search Input (Collapsible/Interactive, desktop) */}
            <div className="relative hidden md:block">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center animate-in fade-in duration-200">
                  <div className="relative w-52 lg:w-64">
                    <FloatingInput
                      type="search"
                      label="পণ্য খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      icon={<Search className="h-3.5 w-3.5" />}
                      className="h-10 sm:h-10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="বন্ধ করুন"
                    className="p-1.5 ml-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-slate-600 hover:text-[#6B112B] hover:bg-rose-50 transition-colors"
                  title="পণ্য খুঁজুন"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick WhatsApp Order Button */}
            <a
              href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-3.5 h-9 font-bold text-xs gap-1.5 shadow-sm shadow-emerald-950/20">
                <MessageCircle className="h-3.5 w-3.5 fill-white" />
                <span>WhatsApp অর্ডার</span>
              </Button>
            </a>

            {/* Mobile: quick call icon */}
            <a
              href="tel:01614258804"
              aria-label="কল করুন"
              className="sm:hidden h-10 w-10 rounded-full flex items-center justify-center text-[#6B112B] bg-rose-50 border border-rose-100 tap-scale"
            >
              <Phone className="h-4 w-4" />
            </a>

            {/* User Account / Login (tablet & desktop; on phones it lives in the drawer) */}
            {session?.user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="সাইন আউট"
                className="hidden sm:inline-flex text-slate-500 hover:text-red-600 rounded-full h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/auth/signin" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm" className="h-9 px-2.5 text-slate-700 hover:text-[#6B112B] hover:bg-rose-50 rounded-full text-xs font-semibold">
                  <User className="h-4 w-4 mr-1 text-slate-500" />
                  <span>লগইন</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-800 h-10 w-10 rounded-full hover:bg-rose-50 tap-scale"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MOBILE SEARCH BAR (Floating Input + Submit Button)     */}
        {/* ========================================================= */}
        <form onSubmit={handleSearch} className="md:hidden px-3 pb-2.5" role="search">
          <div className="relative w-full flex items-center">
            <FloatingInput
              type="search"
              enterKeyHint="search"
              label="চুড়ি আলনা, মন্দির, গহনা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-11 pr-20"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 rounded-lg bg-[#6B112B] text-white text-xs font-semibold tap-scale z-10"
            >
              খুঁজুন
            </button>
          </div>
        </form>
      </header>

      {/* ========================================================= */}
      {/* 4. MOBILE DRAWER MENU (slide-in sheet)                    */}
      {/* ========================================================= */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="lg:hidden w-[86%] max-w-sm p-0 flex flex-col gap-0 border-l-0 [&>button]:text-white [&>button]:opacity-90 [&>button]:top-5 [&>button>svg]:h-5 [&>button>svg]:w-5"
        >
          {/* Drawer brand header */}
          <div className="bg-gradient-to-br from-[#400717] via-[#5C0D24] to-[#300511] text-white px-5 pt-6 pb-5 pr-12">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-white p-0.5 shrink-0">
                <Image src="/images/logo.jpg" alt="নারী নিবেদিত" fill sizes="48px" className="object-contain rounded-full" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-white text-lg font-black font-serif leading-tight">নারী নিবেদিত</SheetTitle>
                <SheetDescription className="text-[11px] text-[#F5E6B3]">সৌন্দর্য • রুচি • ভালোবাসা</SheetDescription>
              </div>
            </div>
            <a
              href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-4 rounded-xl font-bold text-sm shadow-lg shadow-black/20 tap-scale"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span>WhatsApp-এ সরাসরি অর্ডার</span>
            </a>
          </div>

          {/* Scrollable links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
              ন্যাভিগেশন ও ক্যাটাগরি
            </span>
            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between h-12 px-3 rounded-xl text-[15px] font-semibold transition-colors tap-scale ${
                      isActive ? "bg-rose-50 text-[#6B112B]" : "text-slate-800 active:bg-rose-50"
                    }`}
                  >
                    <span>{link.title}</span>
                    {link.badge ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#6B112B]">
                        {link.badge}
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </Link>
                );
              })}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex items-center justify-between h-12 px-3 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 text-[#6B112B] text-[15px] font-bold border border-rose-100"
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-600 fill-rose-600" />
                  <span>হট ডিল অফার</span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#6B112B]" />
              </Link>
            </nav>
          </div>

          {/* Drawer footer: contact + account */}
          <div className="border-t border-rose-100 p-4 space-y-3 bg-slate-50/60 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <a 
              href="tel:01614258804" 
              className="flex items-center gap-3 rounded-xl bg-white border border-rose-100 px-3 h-12"
            >
              <span className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <Phone className="h-4 w-4 text-[#6B112B]" />
              </span>
              <span className="text-xs text-slate-500 leading-tight">
                হটলাইন<br />
                <strong className="text-sm text-slate-900">০১৬১৪-২৫৮৮০৪</strong>
              </span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {session?.user ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-rose-200 text-red-600 font-bold bg-white"
                >
                  <LogOut className="h-4 w-4" /> সাইন আউট
                </button>
              ) : (
                <Link 
                  href="/auth/signin" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#6B112B] text-white font-bold"
                >
                  <User className="h-4 w-4" /> লগইন
                </Link>
              )}
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold"
              >
                <ShieldCheck className="h-4 w-4" /> অ্যাডমিন
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
