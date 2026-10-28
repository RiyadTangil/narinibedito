"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Filter, ArrowUpDown, MessageCircle, Eye, Heart, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuickOrderModal, QuickOrderProduct } from "@/components/quick-order-modal";

const ALL_PRODUCTS = [
  {
    id: "1",
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    category: "চুড়ি আলনা ও বক্স",
    price: 2250,
    originalPrice: 2650,
    rating: 5.0,
    reviews: 48,
    badge: "সেরা বিক্রিত",
    size: "২১\" x ১৬\" সাইজ",
    image: "/images/products/churi-alna.jpg",
    description: "স্বচ্ছ গ্লাস ডোর, মজবুত কাঠের তৈরি এবং সম্পূর্ণ লক ও কি বিশিষ্ট চুড়ি আলনা।",
  },
  {
    id: "2",
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    category: "হোম মন্দির ও ডেকোর",
    price: 3450,
    originalPrice: 4200,
    rating: 4.9,
    reviews: 32,
    badge: "কাস্টমাইজড",
    size: "২৪\" x ১৮\" সাইজ",
    image: "/images/products/home-mandir.jpg",
    description: "সুক্ষ্ম লেজার কাটিং কাঠের কাজ ও ওয়ার্ম এলইডি লাইটিংযুক্ত ঘর সাজানোর মন্দির।",
  },
  {
    id: "3",
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    category: "জুয়েলারি ও চুড়ি",
    price: 580,
    originalPrice: 720,
    rating: 4.9,
    reviews: 65,
    badge: "নতুন স্টক",
    size: "সাইজ ২.৪, ২.৬, ২.৮",
    image: "/images/products/reshmi-churi.jpg",
    description: "ঐতিহ্যবাহী নিখুঁত রেশমি চুড়ির কম্বো সেট। বিয়ে ও উৎসবের সেরা পছন্দ।",
  },
  {
    id: "4",
    name: "এম্বিয়েন্ট এলইডি লাইটিংসহ ড্রয়ারযুক্ত রয়্যাল চুড়ি বক্স",
    category: "চুড়ি আলনা ও বক্স",
    price: 1950,
    originalPrice: 2350,
    rating: 4.9,
    reviews: 41,
    badge: "ট্রেন্ডিং",
    size: "১৮\" x ১৪\" সাইজ",
    image: "/images/products/jewelry-box.jpg",
    description: "ইন-বিল্ট এলইডি লাইট এবং গহনার ড্রয়ারযুক্ত আকর্ষণীয় কাঠের বক্স।",
  },
  {
    id: "5",
    name: "রয়্যাল মাল্টি-লেয়ার জুয়েলারি ও মেকআপ অর্গানাইজার কেবিনেট",
    category: "চুড়ি আলনা ও বক্স",
    price: 1650,
    originalPrice: 1950,
    rating: 4.8,
    reviews: 27,
    badge: "জনপ্রিয়",
    size: "১৬\" x ১২\" সাইজ",
    image: "/images/products/jewelry-box.jpg",
    description: "আলাদা রিং স্লট, নেকলেস হ্যাঙ্গার এবং ভেলভেট কুশনযুক্ত নিরাপদ বক্স।",
  },
  {
    id: "6",
    name: "হ্যান্ডক্রাফটেড ফেয়ারি লাইট গ্লাস বোটল ডেকোর শোপিস",
    category: "শোপিস ও লাইটিং",
    price: 450,
    originalPrice: 550,
    rating: 4.7,
    reviews: 19,
    badge: "গিফট আইটেম",
    size: "স্ট্যান্ডার্ড বোটল সাইজ",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    description: "ঘরের কর্নার বা বেডরুমের অ্যাম্বিয়েন্সের জন্য ফেয়ারি লাইট বোটল ডেকোর।",
  },
  {
    id: "7",
    name: "ঐতিহ্যবাহী গোল্ড-প্লেটেড ব্রাইডাল বালা ও চুড়ি সেট",
    category: "জুয়েলারি ও চুড়ি",
    price: 1150,
    originalPrice: 1450,
    rating: 4.9,
    reviews: 52,
    badge: "ব্রাইডাল স্পেশাল",
    size: "স্ট্যান্ডার্ড সাইজ",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80",
    description: "দীর্ঘস্থায়ী গোল্ড কালার ফিনিশ এবং ঐতিহ্যবাহী কুন্দন ও মিনা কাজের বালা।",
  },
  {
    id: "8",
    name: "ডিজাইনার এমব্রয়ডারি উৎসব কুর্তি ও থ্রি-পিস সেট",
    category: "পোশাক ও আউটফিট",
    price: 1850,
    originalPrice: 2200,
    rating: 4.8,
    reviews: 38,
    badge: "এক্সক্লুসিভ",
    size: "M, L, XL, XXL",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    description: "আরামদায়ক প্রিমিয়াম সুতি কাপড়ে তৈরি গর্জিয়াস ডিজাইনার কুর্তি সেট।",
  },
];

export default function ProductsPage() {
  const [orderModalProduct, setOrderModalProduct] = useState<QuickOrderProduct | null>(null);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-6">
        <div>
          <span className="text-xs font-bold text-[#8B1E3F] tracking-wider uppercase">নারী নিবেদিত শপ</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
            সকল পণ্য সম্ভার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            কাঠের চুড়ি আলনা, হোম মন্দির, ঐতিহ্যবাহী চুড়ি ও ফ্যাশন পোশাকের সমাহার
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-rose-200 text-slate-700">
            <Filter className="h-4 w-4" /> ফিল্টার
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-rose-200 text-slate-700">
            <ArrowUpDown className="h-4 w-4" /> মূল্য অনুযায়ী
          </Button>
          <a
            href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <MessageCircle className="mr-1.5 h-4 w-4 fill-white" /> WhatsApp অর্ডার
            </Button>
          </a>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
        {ALL_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="group relative rounded-[28px] border border-rose-100/90 bg-white p-3 sm:p-3.5 shadow-[0_4px_20px_-4px_rgba(107,17,43,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(107,17,43,0.18)] hover:border-rose-300 transition-all duration-500 flex flex-col justify-between transform hover:-translate-y-1.5"
          >
            {/* Inset Rounded Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-stone-50 via-rose-50/20 to-stone-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Top Left: Boutique Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 bg-[#6B112B]/90 backdrop-blur-md text-[#F5E6B3] border border-[#D4AF37]/40 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
                  {product.badge}
                </span>
              </div>

              {/* Top Right: Wishlist Heart Button */}
              <button
                type="button"
                aria-label="Wishlist"
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
              >
                <Heart className="h-4 w-4 fill-transparent hover:fill-rose-600 transition-colors" />
              </button>

              {/* Bottom Left: Size / Specs */}
              <div className="absolute bottom-3 left-3 z-10">
                <div className="bg-black/70 backdrop-blur-md text-[#FBEBB5] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/15 shadow-sm">
                  {product.size}
                </div>
              </div>

              {/* Hover Quick Action */}
              <Link
                href={`/products/${product.id}`}
                className="absolute inset-x-3 bottom-3 z-20 hidden group-hover:flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md text-[#6B112B] font-bold text-xs py-2 rounded-xl shadow-lg border border-rose-200/80 transition-all duration-300"
              >
                <Eye className="h-3.5 w-3.5" /> বিস্তারিত দেখুন
              </Link>
            </div>

            {/* Details Section */}
            <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between space-y-3.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[11px] font-bold text-[#6B112B] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60 tracking-wide line-clamp-1">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/50 shrink-0">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">({product.reviews})</span>
                  </div>
                </div>

                <Link href={`/products/${product.id}`} className="block group/title">
                  <h3 className="font-bold text-base text-slate-900 group-hover/title:text-[#6B112B] transition-colors line-clamp-2 leading-snug font-serif">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price and Actions */}
              <div className="pt-2.5 border-t border-rose-100/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#6B112B] tracking-tight">৳{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ইন স্টক
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {/* Button 1: Ask Info on WhatsApp */}
                  <a
                    href={`https://wa.me/8801614258804?text=${encodeURIComponent(
                      `হ্যালো নারী নিবেদিত, আমি '${product.name}' সম্পর্কে বিস্তারিত তথ্য জানতে চাই।`
                    )}`}
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

                  {/* Button 2: Direct Order Modal Trigger */}
                  <Button 
                    size="sm" 
                    onClick={() => setOrderModalProduct(product)}
                    className="w-full bg-[#6B112B] hover:bg-[#52091E] text-white font-bold text-xs gap-1.5 rounded-xl h-10 shadow-sm hover:shadow-md transition-all active:scale-95 border-0"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>অর্ডার করুন</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Cash-on-Delivery Order Modal */}
      <QuickOrderModal
        product={orderModalProduct}
        isOpen={!!orderModalProduct}
        onClose={() => setOrderModalProduct(null)}
      />
    </div>
  );
}
