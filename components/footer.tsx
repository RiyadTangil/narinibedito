"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Truck, 
  ShieldCheck, 
  Clock, 
  Headphones, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Sparkles,
  Heart
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Do not render storefront footer on admin or auth pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 pb-[var(--store-bottom-nav)]">
      {/* Feature trust bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/50">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-slate-400">সারাদেশে হোম ডেলিভারি সুবিধা</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">সেরা মানের কাঠের কাজ</h4>
              <p className="text-xs text-slate-400">নিখুঁত কারিগরি ও দীর্ঘস্থায়ী</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400 border border-sky-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">কাস্টমাইজড অর্ডার</h4>
              <p className="text-xs text-slate-400">পছন্দের সাইজ ও রঙে তৈরি</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">২৪/৭ কাস্টমার সাপোর্ট</h4>
              <p className="text-xs text-slate-400">যেকোনো তথ্যে সরাসরি কল ও চ্যাট</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-indigo-400/50 p-0.5 bg-white">
                <Image
                  src="/images/logo.jpg"
                  alt="নারী নিবেদিত"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-serif">নারী নিবেদিত</h3>
                <span className="text-xs text-indigo-400 font-medium block">
                নারীদের জন্য
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              নারীর সৌন্দর্য, রুচি ও ভালোবাসার বিশ্বস্ত ঠিকানা। আপনার প্রিয় চুড়ি, জুয়েলারি ও ঘর সাজানোর জন্য সেরা মানের হস্তশিল্প ও কাঠের অনন্য সংগ্রহ।
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-200 bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-500/30">
                <Heart className="h-3 w-3 fill-indigo-400 text-indigo-400" /> ভালোবাসা দিয়ে তৈরি, আপনার জন্য নিবেদিত
              </span>
            </div>
          </div>

          {/* Quick Category Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              জনপ্রিয় ক্যাটাগরি
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/products?category=churi-alna" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  • চুড়ি আলনা ও গহনার বক্স
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-decor" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  • কাস্টমাইজড হোম মন্দির ও ডেকোর
                </Link>
              </li>
              <li>
                <Link href="/products?category=jewellery" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  • এক্সক্লুসিভ কাচের ও রেশমি চুড়ি
                </Link>
              </li>
              <li>
                <Link href="/products?category=lighting" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  • শোপিস ও এলইডি লাইটিং
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  • ফ্যাশন পোশাক ও আউটফিট
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Customer Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              গ্রাহক সেবা ও লিংক
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">হোম পেজ</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">সকল পণ্য সম্ভার</Link>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/profile.php?id=61579364665165" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  অফিসিয়াল ফেসবুক পেজ (২৫কে+ ফলোয়ার্স)
                </a>
              </li>
              <li>
                <Link href="/auth/signin" className="hover:text-white transition-colors">গ্রাহক একাউন্ট / লগইন</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">অ্যাডমিন ম্যানেজমেন্ট</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details from FB Page */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              যোগাযোগ ও অর্ডার
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>ঢাকা, বাংলাদেশ (সারাদেশে হোম ডেলিভারি)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
                <a href="tel:01614258804" className="hover:text-white transition-colors font-semibold text-slate-200">
                  01614-258804
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <a 
                  href="https://wa.me/8801614258804" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  WhatsApp: +880 1614-258804
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                <a href="mailto:narinibediti@gmail.com" className="hover:text-white transition-colors">
                  narinibediti@gmail.com
                </a>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/8801614258804?text=Hello,%20I%20want%20to%20order%20from%20Nari%20Nibedito"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all text-xs"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300 font-medium">নারী নিবেদিত</strong> (Nari Nibedito). সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px]">নারীদের জন্য</span>
            <span>•</span>
            <span className="text-[11px]">Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
