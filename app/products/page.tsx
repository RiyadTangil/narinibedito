"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Filter, ArrowUpDown, MessageCircle, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ALL_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="group rounded-3xl border border-rose-100 bg-white overflow-hidden hover:shadow-xl hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            {/* Image with Unsplash */}
            <div className="relative h-60 w-full overflow-hidden bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              <Badge className="absolute top-3 left-3 bg-[#8B1E3F] text-white font-medium text-xs border-0 shadow-sm">
                {product.badge}
              </Badge>

              <div className="absolute bottom-3 left-3 bg-black/70 text-[#F5E6B3] text-[11px] px-2 py-0.5 rounded backdrop-blur-sm font-medium">
                {product.size}
              </div>

              <button
                type="button"
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-[#8B1E3F] flex items-center justify-center shadow-sm"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] font-bold text-[#8B1E3F] uppercase tracking-wider">
                  {product.category}
                </span>
                <Link href={`/products/${product.id}`} className="block mt-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#8B1E3F] transition-colors line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-xs pt-1.5 font-bold">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviews})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-lg font-black text-[#7A1233]">৳{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="ml-1.5 text-xs text-slate-400 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                      <MessageCircle className="h-4 w-4 fill-white" />
                    </Button>
                  </a>
                  <Link href={`/products/${product.id}`}>
                    <Button size="sm" variant="default" className="bg-[#8B1E3F] hover:bg-[#701531] text-white text-xs rounded-full h-8 px-3">
                      বিস্তারিত
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
