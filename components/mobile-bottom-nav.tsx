"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, MessageCircle, Phone } from "lucide-react";

/**
 * Storefront app-style bottom tab bar for phones.
 * Height is mirrored by the `--store-bottom-nav` CSS variable (globals.css)
 * so the footer / floating elements can reserve space for it.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  // Hidden on admin/auth, and on product detail pages (they own a sticky purchase bar)
  const isProductDetail = /^\/products\/[^/]+/.test(pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || isProductDetail) {
    return null;
  }

  const items = [
    { title: "হোম", href: "/", icon: Home, active: pathname === "/" },
    { title: "সব পণ্য", href: "/products", icon: LayoutGrid, active: pathname === "/products" },
    { title: "খুঁজুন", href: "/products?focus=search", icon: Search, active: false },
  ];

  const renderItem = (item: (typeof items)[number]) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.title}
        href={item.href}
        className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tap-scale ${
          item.active ? "text-indigo-600" : "text-slate-500"
        }`}
      >
        {item.active && (
          <span className="absolute top-0 h-0.5 w-8 rounded-full bg-indigo-600" />
        )}
        <Icon className={`h-5 w-5 ${item.active ? "stroke-[2.4]" : ""}`} />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="মোবাইল ন্যাভিগেশন"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-6px_20px_-8px_rgba(15,23,42,0.12)] pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-stretch">
        {items.slice(0, 2).map(renderItem)}

        {/* WhatsApp — primary conversion action, raised in the centre */}
        <a
          href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-emerald-700 tap-scale"
        >
          <span className="-mt-5 h-11 w-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-4 ring-white">
            <MessageCircle className="h-5 w-5 fill-white" />
          </span>
          <span>অর্ডার</span>
        </a>

        {items.slice(2).map(renderItem)}

        {/* Call */}
        <a
          href="tel:01614258804"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-500 tap-scale"
        >
          <Phone className="h-5 w-5" />
          <span>কল</span>
        </a>
      </div>
    </nav>
  );
}
