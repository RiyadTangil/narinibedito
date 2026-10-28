"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  Heart,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Truck,
  User,
  Flame,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
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
    { title: "চুড়ি আলনা", href: "/products?category=churi-alna", badge: "সেরা" },
    { title: "হোম মন্দির", href: "/products?category=home-decor" },
    { title: "চুড়ি ও গহনা", href: "/products?category=jewellery" },
    { title: "শোপিস ও লাইটিং", href: "/products?category=lighting" },
    { title: "সব পণ্য", href: "/products" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-rose-100/80 transition-all">
      {/* ========================================================= */}
      {/* 1. SLIM TOP ANNOUNCEMENT BAR (Subtle, single micro line)   */}
      {/* ========================================================= */}
      <div className="bg-[#5A0D22] text-rose-100 text-[11px] sm:text-xs py-1 px-4 border-b border-[#72122C]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#F5E6B3] font-semibold">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" /> সৌন্দর্য • রুচি • ভালোবাসা
            </span>
            <span className="hidden md:inline text-rose-300/40">|</span>
            <span className="hidden md:inline text-rose-200">
              সারাদেশে ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium">
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
            <span className="text-rose-400/40 hidden sm:inline">|</span>
            <Link 
              href="/admin" 
              className="hidden sm:inline text-rose-300 hover:text-white text-[11px] transition-colors"
            >
              অ্যাডমিন
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SINGLE UNIFIED MODERN NAVBAR                           */}
      {/* Logo on Left, Nav Links in Center, Actions on Right       */}
      {/* ========================================================= */}
      <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 xl:gap-6 flex-nowrap">
        
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative h-11 w-11 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-[#D4AF37] p-0.5 bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/images/logo.jpg"
              alt="নারী নিবেদিত লোগো"
              fill
              className="object-contain rounded-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#6B112B] leading-none font-serif">
              নারী নিবেদিত
            </span>
            <span className="text-[10px] font-semibold text-[#B8860B] tracking-wider mt-0.5">
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
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase leading-tight whitespace-nowrap ${
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

        {/* Right: Actions (Search, WhatsApp Order, Cart, User) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
          
          {/* Integrated Search Input (Collapsible/Interactive) */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <div className="flex items-center animate-in fade-in duration-200">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  autoFocus
                  className="h-9 w-44 lg:w-56 rounded-full border border-rose-300 bg-rose-50/40 pl-3 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6B112B]"
                />
                <Link href={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : "/products"}>
                  <button type="button" className="absolute right-7 text-slate-400 hover:text-[#6B112B]">
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 ml-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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

          {/* Shopping Cart Pill */}
          <Link href="/products">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-rose-200 hover:bg-rose-50 text-[#6B112B] h-9 px-3 gap-1.5 shadow-none"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4" />
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#6B112B] text-[8px] font-bold text-white">
                  ০
                </span>
              </div>
              <span className="hidden sm:inline font-bold text-xs">Cart</span>
            </Button>
          </Link>

          {/* User Account / Login */}
          {session?.user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="সাইন আউট"
              className="text-slate-500 hover:text-red-600 rounded-full h-9 w-9"
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-800 h-9 w-9 rounded-full hover:bg-rose-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE SEARCH BAR (Slim & Clean)                       */}
      {/* ========================================================= */}
      <div className="md:hidden px-4 pb-2.5">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="চুড়ি আলনা, হোম মন্দির, অলংকার খুঁজুন..."
            className="h-8 w-full rounded-full border border-rose-200 bg-rose-50/20 pl-8 pr-16 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#6B112B]"
          />
          <Link href={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : "/products"}>
            <button
              type="button"
              className="absolute right-1 top-1 h-6 px-2.5 rounded-full bg-[#6B112B] text-white text-[10px] font-semibold"
            >
              খুঁজুন
            </button>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE DRAWER MENU                                     */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-rose-100 px-5 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <a
            href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            <span>WhatsApp-এ সরাসরি অর্ডার (০১৬১৪-২৫৮৮০৪)</span>
          </a>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              ন্যাভিগেশন ও ক্যাটাগরি
            </span>
            <nav className="flex flex-col space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-rose-50 text-slate-800 text-sm font-semibold transition-colors"
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
              ))}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-rose-50/70 text-[#6B112B] text-sm font-bold"
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-600 fill-rose-600" />
                  <span>হট ডিল অফার</span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#6B112B]" />
              </Link>
            </nav>
          </div>

          <div className="pt-3 border-t border-rose-100 space-y-2 text-xs">
            <a 
              href="tel:01614258804" 
              className="flex items-center gap-2 text-slate-700 py-1 px-2 font-medium"
            >
              <Phone className="h-4 w-4 text-[#6B112B]" />
              <span>হটলাইন: <strong className="text-slate-900">০১৬১৪-২৫৮৮০৪</strong></span>
            </a>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 px-2">
              <Link 
                href="/auth/signin" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-[#6B112B] font-bold"
              >
                একাউন্ট লগইন
              </Link>
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-slate-500 hover:text-[#6B112B]"
              >
                অ্যাডমিন প্যানেল
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
