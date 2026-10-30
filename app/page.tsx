"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Truck, 
  Phone, 
  MessageCircle, 
  Heart, 
  Lock, 
  Lightbulb, 
  Award, 
  Eye, 
  Check, 
  Package, 
  HelpCircle, 
  ChevronDown, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsSection } from "@/components/reviews-section";
import { QuickOrderModal, QuickOrderProduct } from "@/components/quick-order-modal";

// Categories and products are dynamically fetched from MongoDB via /api/categories and /api/products

// Frequently Asked Questions
const FAQS = [
  {
    q: "কাঁচের চুড়ি আলনা কুরিয়ারে ভাঙার কোনো ঝুঁকি আছে কি?",
    a: "একদমই না! প্রতিটি আলনা পাঠানোর আগে বাবল র্যাপ ও শক্ত কাঠের ফ্রেম দিয়ে সুরক্ষিতভাবে প্যাকেজিং করা হয়। এছাড়া ডেলিভারি পাওয়ার পর পণ্য দেখে নেয়ার সুযোগ থাকে। কোনো ক্ষতি হলে আমরা অবিলম্বে পরিবর্তন করে দিই।"
  },
  {
    q: "সারা বাংলাদেশে ডেলিভারি পেতে কতদিন সময় লাগে?",
    a: "ঢাকা সিটির মধ্যে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সারা বাংলাদেশের যেকোনো জেলা ও উপজেলায় ২ থেকে ৪ দিনের মধ্যে হোম ডেলিভারি পৌঁছে দেওয়া হয়।"
  },
  {
    q: "ক্যাশ অন ডেলিভারিতে কি মূল্য পরিশোধ করা যায়?",
    a: "হ্যাঁ, নারী নিবেদিতে আপনি সারাদেশেই সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধায় পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করতে পারবেন।"
  },
  {
    q: "আমার ঘরের নির্দিষ্ট মাপে কি কাস্টমাইজড চুড়ি আলনা বা মন্দির তৈরি সম্ভব?",
    a: "হ্যাঁ, আমরা গ্রাহকের পছন্দের মাপ, নকশা ও রঙের উপর ভিত্তি করে কাস্টমাইজড অর্ডার গ্রহণ করি। বিস্তারিত জানতে সরাসরি আমাদের হোয়াটসঅ্যাপ (০১৬১৪-২৫৮৮০৪) নম্বরে যোগাযোগ করুন।"
  }
];

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [orderModalProduct, setOrderModalProduct] = useState<QuickOrderProduct | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([catRes, prodRes]) => {
        if (!isMounted) return;
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (prodRes.success && Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        }
      })
      .catch((err) => {
        console.error("Home page load error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = selectedFilter === "all" 
    ? products 
    : products.filter(p => p.categorySlug === selectedFilter || p.category === selectedFilter);

  return (
    <div className="space-y-10 sm:space-y-20 pb-10 sm:pb-20 overflow-x-hidden">

      {/* ========================================================= */}
      {/* 1. LUXURY HERO BANNER WITH BRAND VISUALS                  */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#400717] via-[#5C0D24] to-[#300511] text-white">
        {/* Glow and subtle artistic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(212,175,55,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 sm:w-96 h-80 sm:h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-7 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              
              {/* Brand Tagline Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-[#FBEBB5] shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                <span>নারীর সৌন্দর্য, রুচি ও ভালোবাসার বিশ্বস্ত ঠিকানা</span>
              </div>

              {/* Catchy Bengali Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.2] font-serif">
                সৌন্দর্য ও রুচির ছোঁয়ায় <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0F3] via-[#F3DE9C] to-[#FFF0F3]">
                  নারী নিবেদিত
                </span>
              </h1>

              {/* High-converting description */}
              <p className="text-rose-100/90 text-xs sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                আপনার প্রিয় চুড়ি, অলংকার ও গৃহকোণ সাজাতে হস্তনির্মিত সেরা মানের কাঠের <strong>চুড়ি আলনা</strong>, এলইডি ব্যাকলিট <strong>হোম মন্দির</strong>, ঐতিহ্যবাহী <strong>চুড়ি ও গহনা</strong> এবং ট্রেন্ডি <strong>ফ্যাশন কালেকশন</strong>।
              </p>

              {/* Bullet Features with Icons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs text-rose-200 pt-0.5 font-medium">
                <span className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3 w-3 text-[#D4AF37]" /> ১০০% আসল কাঠের তৈরি
                </span>
                <span className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3 w-3 text-[#D4AF37]" /> ১৪০+ ডজন ধারণক্ষমতা
                </span>
                <span className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3 w-3 text-[#D4AF37]" /> ক্যাশ অন ডেলিভারি
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                <a
                  href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40 rounded-full px-4 sm:px-7 h-11 sm:h-12 text-xs sm:text-base gap-1.5 sm:gap-2 tap-scale">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 fill-white shrink-0" />
                    <span>WhatsApp অর্ডার</span>
                  </Button>
                </a>

                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c29e2e] text-[#4A0A1C] font-bold shadow-lg shadow-amber-950/30 rounded-full px-4 sm:px-7 h-11 sm:h-12 text-xs sm:text-base gap-1.5 sm:gap-2 tap-scale">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>সব কালেকশন</span>
                  </Button>
                </Link>

                <a href="tel:01614258804" className="col-span-2 sm:col-span-1 hidden sm:inline-block">
                  <Button size="lg" variant="outline" className="border-rose-300/40 bg-white/10 text-white hover:bg-white/20 rounded-full px-5 h-12 text-sm gap-2">
                    <Phone className="h-4 w-4 text-[#D4AF37]" />
                    <span>০১৬১৪-২৫৮৮০৪</span>
                  </Button>
                </a>
              </div>

              {/* Social proof counters */}
              <div className="pt-3 sm:pt-6 border-t border-rose-800/60 flex items-center justify-center lg:justify-start gap-5 sm:gap-8 text-xs text-rose-200">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">২৫,০০০+</div>
                  <div className="text-[10px] sm:text-[11px] text-rose-300">ফেসবুক ফলোয়ার্স</div>
                </div>
                <div className="h-7 w-px bg-rose-700/60" />
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">৪.৯ ★</div>
                  <div className="text-[10px] sm:text-[11px] text-rose-300">গ্রাহক সন্তুষ্টি রিভিউ</div>
                </div>
                <div className="h-7 w-px bg-rose-700/60" />
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">৬৪ জেলায়</div>
                  <div className="text-[10px] sm:text-[11px] text-rose-300">হোম ডেলিভারি</div>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase Card with Real Brand Assets */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Decorative glowing card frame */}
                <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-tr from-[#D4AF37]/50 via-rose-300/20 to-[#D4AF37]/50 shadow-2xl backdrop-blur-md border border-white/20">
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                    
                    {/* Cover banner image preview */}
                    <div className="relative h-44 sm:h-64 w-full">
                      <Image
                        src="/images/cover-banner.png"
                        alt="নারী নিবেদিত কভার ব্যানার"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3.5 sm:p-4">
                        <div className="text-white">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                            অফিসিয়াল ব্র্যান্ড কালেকশন
                          </span>
                          <h3 className="text-xs sm:text-base font-bold">১৪০+ ডজন ধারণক্ষমতার প্রিমিয়াম চুড়ি আলনা</h3>
                        </div>
                      </div>
                    </div>

                    {/* Logo & Highlights below */}
                    <div className="p-3.5 sm:p-5 bg-gradient-to-b from-white to-[#FFF9FA] text-slate-900 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-full border-2 border-[#D4AF37] p-0.5 bg-white shadow-md">
                          <Image
                            src="/images/logo.jpg"
                            alt="নারী নিবেদিত লোগো"
                            fill
                            className="object-contain rounded-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#6B112B] text-sm sm:text-lg leading-tight font-serif">
                            নারী নিবেদিত
                          </h4>
                          <span className="text-[11px] sm:text-xs text-[#B8860B] font-semibold">
                            সৌন্দর্য • রুচি • ভালোবাসা
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] font-medium text-slate-700">
                        <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-100 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-[#6B112B] shrink-0" />
                          <span className="truncate">লক ও চাবি সিস্টেম</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-100 flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">ওয়ার্ম এলইডি লাইটিং</span>
                        </div>
                        <div className="p-2 rounded-lg bg-pink-50/80 border border-pink-100 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                          <span className="truncate">নিরাপদ গ্লাস ডোর</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">ক্যাশ অন ডেলিভারি</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-3.5 -left-3.5 bg-[#6B112B] text-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-[#D4AF37]/50 hidden sm:flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <div className="text-xs font-black">১০০% আসল হস্তশিল্প</div>
                    <div className="text-[10px] text-rose-200">নিখুঁত কারিগরি যত্ন</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================= */}
      {/* 3. OFFICIAL 8 FB CATEGORIES (Skeleton + Marquee Slider)   */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full mb-1.5 sm:mb-2 border border-rose-200">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> অফিসিয়াল ক্যাটাগরি
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              পছন্দের ক্যাটাগরি বেছে নিন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              আপনার রুচি ও প্রয়োজন অনুযায়ী নারী নিবেদিতের সম্পূর্ণ বিশেষ কালেকশন
            </p>
          </div>

          <Link 
            href="/products" 
            className="text-xs sm:text-sm font-bold text-[#6B112B] hover:text-[#50091D] inline-flex items-center gap-1 group shrink-0"
          >
            সব দেখুন <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Loading Skeleton or Infinite Marquee Track */}
        {loading ? (
          <div className="flex items-center gap-3.5 sm:gap-5 overflow-hidden py-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`cat-skel-${idx}`}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-rose-100/90 min-h-[165px] sm:min-h-[220px] w-40 sm:w-52 lg:w-56 shrink-0 bg-white p-3 flex flex-col justify-end space-y-2 shadow-sm"
              >
                <Skeleton className="absolute inset-0 rounded-none bg-rose-100/50" />
                <div className="relative z-10 flex flex-col items-center space-y-1.5 pt-20">
                  <Skeleton className="h-4 w-14 rounded-full bg-rose-200/70" />
                  <Skeleton className="h-4 w-28 rounded-md bg-rose-200/80" />
                  <Skeleton className="h-3 w-16 rounded-md bg-rose-100/80" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden w-full marquee-pause-hover py-2">
            {/* Subtle Left & Right Edge Gradient Fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

            <div className="flex items-center">
              {/* Track 1 */}
              <div className="animate-marquee-infinite flex items-center gap-3.5 sm:gap-5 pr-3.5 sm:pr-5">
                {categories.map((cat, idx) => (
                  <Link
                    key={`track1-${cat.id || cat._id}-${idx}`}
                    href={`/products?category=${cat.id}`}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-rose-100/90 shadow-sm hover:shadow-xl hover:border-[#6B112B]/50 transition-all flex flex-col justify-end min-h-[165px] sm:min-h-[220px] w-40 sm:w-52 lg:w-56 shrink-0 bg-slate-900"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={cat.image || "/images/products/churi-alna.jpg"}
                        alt={cat.title}
                        fill
                        sizes="220px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 group-hover:via-black/55 transition-colors" />
                    </div>

                    <div className="relative z-10 p-3 sm:p-4 space-y-1 text-center flex flex-col items-center">
                      {cat.badge && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#F5E6B3] bg-[#6B112B]/90 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/35 backdrop-blur-sm mb-0.5 shadow-xs">
                          {cat.badge}
                        </span>
                      )}
                      <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#F5E6B3] transition-colors leading-tight line-clamp-1">
                        {cat.title}
                      </h3>
                      {cat.count && (
                        <span className="text-[10px] sm:text-[11px] text-rose-200/90 font-medium">
                          {cat.count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Track 2 (Seamless Infinite Clone) */}
              <div aria-hidden="true" className="animate-marquee-infinite flex items-center gap-3.5 sm:gap-5 pr-3.5 sm:pr-5">
                {categories.map((cat, idx) => (
                  <Link
                    key={`track2-${cat.id || cat._id}-${idx}`}
                    href={`/products?category=${cat.id}`}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-rose-100/90 shadow-sm hover:shadow-xl hover:border-[#6B112B]/50 transition-all flex flex-col justify-end min-h-[165px] sm:min-h-[220px] w-40 sm:w-52 lg:w-56 shrink-0 bg-slate-900"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={cat.image || "/images/products/churi-alna.jpg"}
                        alt={cat.title}
                        fill
                        sizes="220px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 group-hover:via-black/55 transition-colors" />
                    </div>

                    <div className="relative z-10 p-3 sm:p-4 space-y-1 text-center flex flex-col items-center">
                      {cat.badge && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#F5E6B3] bg-[#6B112B]/90 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/35 backdrop-blur-sm mb-0.5 shadow-xs">
                          {cat.badge}
                        </span>
                      )}
                      <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#F5E6B3] transition-colors leading-tight line-clamp-1">
                        {cat.title}
                      </h3>
                      {cat.count && (
                        <span className="text-[10px] sm:text-[11px] text-rose-200/90 font-medium">
                          {cat.count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. REALISTIC FEATURED PRODUCTS (Skeleton + 2-Col Mobile)  */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full mb-1.5 sm:mb-2 border border-rose-200">
              <Award className="h-3.5 w-3.5 text-[#D4AF37]" /> সর্বাধিক বিক্রিত পণ্য
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              গ্রাহকদের সেরা পছন্দের কালেকশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              হাতে তৈরি নিখুঁত চুড়ি আলনা, হোম মন্দির, ঐতিহ্যবাহী চুড়ি ও এক্সক্লুসিভ জুয়েলারি
            </p>
          </div>

          {/* Filter Pills (Horizontally scrollable on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`pill-skel-${i}`} className="h-8 w-20 rounded-full shrink-0 bg-rose-100/60" />
              ))
            ) : (
              <>
                <Button
                  size="sm"
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                  className={`rounded-full text-xs h-9 sm:h-8 shrink-0 ${
                    selectedFilter === "all" 
                      ? "bg-[#6B112B] hover:bg-[#50091D] text-white" 
                      : "border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#6B112B]"
                  }`}
                >
                  সব পণ্য
                </Button>
                {categories.slice(0, 6).map((cat) => (
                  <Button
                    key={cat.id || cat._id}
                    size="sm"
                    variant={selectedFilter === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedFilter(cat.id)}
                    className={`rounded-full text-xs h-9 sm:h-8 shrink-0 ${
                      selectedFilter === cat.id 
                        ? "bg-[#6B112B] hover:bg-[#50091D] text-white" 
                        : "border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#6B112B]"
                    }`}
                  >
                    {cat.title}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Products Grid or Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-7">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`prod-skel-${idx}`}
                className="rounded-2xl sm:rounded-[28px] border border-rose-100 bg-white p-2 sm:p-3.5 shadow-xs space-y-3"
              >
                <Skeleton className="aspect-square sm:aspect-[4/5] w-full rounded-xl sm:rounded-2xl bg-rose-100/50" />
                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-16 rounded-full bg-rose-100/60" />
                    <Skeleton className="h-4 w-10 rounded-full bg-amber-100/60" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md bg-slate-200/70" />
                  <Skeleton className="h-4 w-2/3 rounded-md bg-slate-100" />
                  <div className="pt-2 border-t border-rose-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20 rounded-md bg-rose-100/80" />
                      <Skeleton className="h-4 w-12 rounded-full bg-emerald-100/60 hidden sm:block" />
                    </div>
                    <div className="flex gap-1.5">
                      <Skeleton className="h-9 flex-1 rounded-xl bg-rose-200/60" />
                      <Skeleton className="h-9 w-9 sm:flex-1 rounded-xl bg-emerald-100/60" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-7">
            {filteredProducts.map((product) => {
              const prodId = product.id || product._id;
              const quickOrderData: QuickOrderProduct = {
                id: prodId,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image || "/images/products/churi-alna.jpg",
                size: product.size,
                sku: product.sku,
                category: product.category,
              };
              const whatsappInfoUrl = `https://wa.me/8801614258804?text=${encodeURIComponent(
                `হ্যালো নারী নিবেদিত, আমি '${product.name}' সম্পর্কে বিস্তারিত তথ্য জানতে চাই।`
              )}`;

              return (
                <div
                  key={prodId}
                  className="group relative min-w-0 rounded-2xl sm:rounded-[28px] border border-rose-100/90 bg-white p-2 sm:p-3.5 shadow-[0_4px_20px_-4px_rgba(107,17,43,0.06)] lg:hover:shadow-[0_22px_45px_-12px_rgba(107,17,43,0.18)] lg:hover:border-rose-300 transition-all duration-500 flex flex-col justify-between lg:hover:-translate-y-1.5"
                >
                  {/* Product Visual Container with Inset Rounded Frame */}
                  <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-b from-stone-50 via-rose-50/20 to-stone-100">
                    <Link href={`/products/${prodId}`} aria-label={product.name} className="absolute inset-0 z-0">
                      <Image
                        src={product.image || "/images/products/churi-alna.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                    </Link>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 sm:from-black/65 via-black/10 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Left: Luxury Boutique Badge */}
                    {product.badge && (
                      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10 max-w-[70%] pointer-events-none">
                        <span className="inline-flex items-center gap-1 bg-[#6B112B]/90 backdrop-blur-md text-[#F5E6B3] border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md truncate max-w-full">
                          <Sparkles className="h-2.5 w-2.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{product.badge}</span>
                        </span>
                      </div>
                    )}

                    {/* Top Right: Discount Pill & Heart Wishlist */}
                    <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 flex flex-col items-end gap-1.5">
                      {product.discount && (
                        <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
                          {product.discount}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label="Wishlist"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm flex items-center justify-center transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-1 lg:group-hover:translate-y-0"
                      >
                        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-transparent hover:fill-rose-600 transition-colors" />
                      </button>
                    </div>

                    {/* Bottom Left: Size & Specification Chip */}
                    {product.size && (
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10 max-w-[85%] pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-md text-[#FBEBB5] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/15 shadow-sm flex items-center gap-1 truncate">
                          <Package className="h-3 w-3 text-[#D4AF37] shrink-0 hidden sm:inline" />
                          <span className="truncate">{product.size}</span>
                        </div>
                      </div>
                    )}

                    {/* Hover Reveal: Floating Quick View Link (Desktop) */}
                    <Link
                      href={`/products/${prodId}`}
                      className="absolute inset-x-3 bottom-3 z-20 hidden lg:group-hover:flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md text-[#6B112B] font-bold text-xs py-2 rounded-xl shadow-lg border border-rose-200/80 transition-all duration-300"
                    >
                      <Eye className="h-3.5 w-3.5" /> বিস্তারিত দেখুন
                    </Link>
                  </div>

                  {/* Product Details Section */}
                  <div className="pt-2 sm:pt-3.5 pb-0.5 sm:pb-1 px-0.5 sm:px-1 flex-1 flex flex-col justify-between gap-2 sm:gap-3.5 min-w-0">
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                      {/* Category Pill and Rating Bar (Desktop/Tablet) */}
                      <div className="hidden sm:flex items-center justify-between text-xs gap-2">
                        <span className="text-[11px] font-bold text-[#6B112B] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60 tracking-wide line-clamp-1">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/50 shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating || "5.0"}</span>
                          <span className="text-slate-400 font-normal">({product.reviews || 0})</span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <Link href={`/products/${prodId}`} className="block group/title">
                        <h3 className="font-bold text-xs sm:text-base text-slate-900 group-hover/title:text-[#6B112B] transition-colors line-clamp-2 leading-snug font-serif">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Mobile Rating row */}
                      <div className="flex sm:hidden items-center gap-1 text-[10px] font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating || "5.0"}</span>
                        <span className="text-slate-400 font-normal">({product.reviews || 0})</span>
                      </div>

                      {/* Highlights / Features Micro Badges (Desktop) */}
                      {product.highlight && (
                        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-0.5">
                          {product.highlight.split("•").slice(0, 2).map((item: string, idx: number) => (
                            <span key={idx} className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 flex items-center gap-1">
                              <Check className="h-2.5 w-2.5 text-emerald-600" />
                              <span className="truncate max-w-[130px]">{item.trim()}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and Stock Status */}
                    <div className="pt-2 sm:pt-2.5 border-t border-rose-100/80 space-y-2 sm:space-y-3">
                      <div className="flex items-baseline justify-between gap-1">
                        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                          <span className="text-base sm:text-2xl font-black text-[#6B112B] tracking-tight">
                            ৳{product.price?.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ইন স্টক
                        </div>
                      </div>

                      {/* Mobile Actions: Primary Order + Compact WhatsApp Icon */}
                      <div className="flex sm:hidden items-center gap-1.5">
                        <Button 
                          size="sm" 
                          onClick={() => setOrderModalProduct(quickOrderData)}
                          className="flex-1 min-w-0 h-9 bg-[#6B112B] hover:bg-[#52091E] text-white font-bold text-xs gap-1 rounded-xl shadow-sm active:scale-95 border-0 px-2"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                          <span className="truncate">অর্ডার</span>
                        </Button>
                        <a
                          href={whatsappInfoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="WhatsApp-এ তথ্য জানুন"
                          className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                        </a>
                      </div>

                      {/* Desktop Actions: 2-Column Grid */}
                      <div className="hidden sm:grid grid-cols-2 gap-2 pt-0.5">
                        <a
                          href={whatsappInfoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full border-emerald-300 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 font-bold text-xs gap-1.5 rounded-xl h-10 shadow-sm transition-all"
                          >
                            <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                            <span>তথ্য জানুন</span>
                          </Button>
                        </a>

                        <Button 
                          size="sm" 
                          onClick={() => setOrderModalProduct(quickOrderData)}
                          className="w-full bg-[#6B112B] hover:bg-[#52091E] text-white font-bold text-xs gap-1.5 rounded-xl h-10 shadow-sm hover:shadow-md transition-all active:scale-95 border-0"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37]" />
                          <span>অর্ডার করুন</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-6 sm:pt-8">
          <Link href="/products">
            <Button size="lg" className="bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-full px-7 sm:px-8 h-11 sm:h-12 text-xs sm:text-sm shadow-md tap-scale">
              সব কালেকশন একসাথে দেখুন <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SPOTLIGHT: কেন নারী নিবেদিতের চুড়ি আলনা সেরা?           */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF5F7] border border-rose-200 p-5 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-[#6B112B] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> হস্তশিল্পের অনন্য নিদর্শন
              </div>

              <h2 className="text-xl sm:text-4xl font-extrabold text-[#6B112B] tracking-tight font-serif leading-tight">
                কেন নারী নিবেদিতের <br />
                <span className="text-[#B8860B]">কাঠের চুড়ি আলনা</span> গ্রাহকদের এত প্রিয়?
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                আপনার মূল্যবান কাচের, রেশমি ও ধাতব চুড়িগুলো ঘরের কোণে এলোমেলো না রেখে সাজিয়ে রাখুন পরিপাটি ও নিরাপদে। নারী নিবেদিতের প্রতিটি চুড়ি আলনা তৈরি করা হয় দক্ষ কারিগরের নিখুঁত হাতে।
              </p>

              <div className="space-y-3 sm:space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#6B112B] shrink-0 font-bold text-xs sm:text-sm">
                    ১
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">স্বচ্ছ গ্লাস ডোর ও সিকিউরিটি লক</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">বাইরে থেকে পছন্দের চুড়ি দেখা যায় এবং তালা দিয়ে নিরাপদে বন্ধ করে রাখা যায়।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-amber-100 flex items-center justify-center text-[#B8860B] shrink-0 font-bold text-xs sm:text-sm">
                    ২
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">১৪০+ ডজন চুড়ির বিশাল ধারণক্ষমতা</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">সহজেই বের করা ও ঢুকানো যায় এমন মসৃণ কাঠের স্টিক সমৃদ্ধ বহুস্তর ড্রয়ার।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 font-bold text-xs sm:text-sm">
                    ৩
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">ইন-বিল্ট অ্যাম্বিয়েন্ট এলইডি লাইটিং</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">রাতের বেলা আলো জ্বালালে পুরো ড্রেসিং কর্নার বা শোকেস মোহনীয় রূপ ধারণ করে।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold text-xs sm:text-sm">
                    ৪
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">কাস্টমাইজড মাপ ও পলিশ সুবিধা</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">আপনার রুমের খালি জায়গা অনুযায়ী মেহগনি বা সেগুন কাঠের বিশেষ সাইজে বানিয়ে নেওয়ার সুযোগ।</p>
                  </div>
                </div>
              </div>

              <div className="pt-1 sm:pt-2">
                <a
                  href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20customize%20a%20Churi%20Alna"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="w-full sm:w-auto bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-full px-6 sm:px-7 h-11 sm:h-12 text-xs sm:text-sm shadow-lg tap-scale">
                    <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 fill-white" />
                    <span>কাস্টমাইজড সাইজে অর্ডার দিতে চ্যাট করুন</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side craftsmanship highlight with real photos */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-xl bg-white p-1.5 sm:p-2">
                <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/gallery.jpg"
                    alt="নারী নিবেদিত কারিগরি কাজ"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                    <span className="text-[11px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                      হাতে তৈরি কাঠের অনন্য শিল্প
                    </span>
                    <h3 className="text-base sm:text-lg font-bold">নিখুঁত কারিগরি যত্ন ও ভালোবাসা দিয়ে তৈরি</h3>
                    <p className="text-[11px] sm:text-xs text-rose-200 mt-1">
                      প্রতিটি কাঠের কোণ সুন্দরভাবে পলিশ করা এবং প্রিমিয়াম গ্লাস ফিটিং
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-rose-200 max-w-xs hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">নিরাপদ কাঠের প্যাকিং</h5>
                    <p className="text-[11px] text-slate-500">ভাঙার ভয় ছাড়াই নিরাপদে কুরিয়ার</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. HOW EASY IT IS TO ORDER (৩টি সহজ ধাপ)                 */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2 mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> সহজ অর্ডার প্রক্রিয়া
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            ৩টি সহজ ধাপে অর্ডার করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ঝামেলামুক্ত ও নিশ্চিন্তে ঘরে বসেই হোম ডেলিভারিতে পণ্য বুঝে নিন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm text-center space-y-2 sm:space-y-3 relative">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-rose-100 text-[#6B112B] flex items-center justify-center font-black text-base sm:text-lg mx-auto">
              ১
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">পছন্দের পণ্য বেছে নিন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              চুড়ি আলনা, হোম মন্দির বা পছন্দের জুয়েলারি আইটেম সিলেক্ট করুন।
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm text-center space-y-2 sm:space-y-3 relative">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-amber-100 text-[#B8860B] flex items-center justify-center font-black text-base sm:text-lg mx-auto">
              ২
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">WhatsApp বা ওয়েবসাইটে অর্ডার</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              সরাসরি ওয়েবসাইটে বা হোয়াটসঅ্যাপে আপনার নাম, ঠিকানা ও ফোন নম্বর পাঠান।
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm text-center space-y-2 sm:space-y-3 relative">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-base sm:text-lg mx-auto">
              ৩
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">পণ্য দেখে ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ডেলিভারিম্যানের কাছ থেকে পণ্য বুঝে পেয়ে নিশ্চিন্তে টাকা পরিশোধ করুন।
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REAL CUSTOMER REVIEWS & FEEDBACK                       */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <ReviewsSection productId="all" productTitle="নারী নিবেদিত শপ" />
      </section>

      {/* ========================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                      */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center space-y-1.5 sm:space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <HelpCircle className="h-3.5 w-3.5 text-[#D4AF37]" /> আপনার যেকোনো প্রশ্ন
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            সাধারণ জিজ্ঞাসা ও উত্তর
          </h2>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-xs sm:text-base flex items-center justify-between gap-4 hover:text-[#6B112B] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#6B112B]" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-rose-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. VIP INSTANT WHATSAPP / CALL CTA BANNER                 */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#50091D] via-[#6B112B] to-[#400717] text-white p-6 sm:p-12 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.22),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[#F5E6B3]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> সরাসরি কথা বলুন
            </div>

            <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight">
              পছন্দের সাইজ বা ডিজাইনে <br />
              অর্ডার দিতে চান?
            </h2>

            <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
              আপনার ঘরের মাপ বা পছন্দের কালার জানাতে সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন অথবা ফোনে যোগাযোগ করুন। সারা বাংলাদেশে পৌঁছে দেওয়া হবে ক্যাশ অন ডেলিভারিতে।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
              <a
                href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full px-6 sm:px-8 h-11 sm:h-12 shadow-lg gap-2 text-xs sm:text-base tap-scale">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
                  <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
                </Button>
              </a>

              <a href="tel:01614258804" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c29e2e] text-[#4A0A1C] font-bold rounded-full px-6 sm:px-8 h-11 sm:h-12 shadow-lg gap-2 text-xs sm:text-base tap-scale">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>০১৬১৪-২৫৮৮০৪ নম্বরে কল করুন</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Cash-on-Delivery Order Modal */}
      <QuickOrderModal
        product={orderModalProduct}
        isOpen={!!orderModalProduct}
        onClose={() => setOrderModalProduct(null)}
      />

    </div>
  );
}
