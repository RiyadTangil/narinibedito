"use client";

import { useState } from "react";
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
  CheckCircle2,
  Package,
  Layers,
  HelpCircle,
  ChevronDown,
  Gift,
  Home,
  Gem,
  Palette,
  ShoppingBasket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 8 Official Categories directly derived from the Facebook Cover Banner & Page
const CATEGORIES = [
  {
    id: "churi-alna",
    title: "চুড়ি আলনা ও শোকেস",
    subtitle: "Bangle Alna & Showcase",
    count: "১৪০+ ডজন ধারণক্ষমতা",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    badge: "সেরা বিক্রিত",
    tag: "হস্তশিল্প",
  },
  {
    id: "home-decor",
    title: "হোম মন্দির ও ডেকোর",
    subtitle: "Custom Mandir & Decor",
    count: "এলইডি ব্যাকলিট ডিজাইন",
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80",
    badge: "কাস্টমাইজড",
    tag: "আলোকিত",
  },
  {
    id: "jewellery",
    title: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    subtitle: "Reshmi & Bridal Bangles",
    count: "রেশমি ও কাচের কালেকশন",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
    badge: "হট কালেকশন",
    tag: "ঐতিহ্যবাহী",
  },
  {
    id: "organizer",
    title: "জুয়েলারি বক্স ও কেবিনেট",
    subtitle: "Multi-layer Organizer",
    count: "ভেলভেট ড্রয়ার ও চাবি লক",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    badge: "রয়্যাল ফিনিশ",
    tag: "সুরক্ষিত",
  },
  {
    id: "lighting",
    title: "শোপিস ও ফেয়ারি লাইটিং",
    subtitle: "Showpieces & Fairy Lights",
    count: "হ্যান্ডমেড বোটল আর্ট",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
    badge: "গিফট চয়েস",
    tag: "নান্দনিক",
  },
  {
    id: "clothing",
    title: "পোশাক ও উৎসবের কুর্তি",
    subtitle: "Women's Festive Outfits",
    count: "ট্রেন্ডি ও প্রিমিয়াম ফেব্রিক",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    badge: "নিউ অ্যারাইভাল",
    tag: "ফ্যাশন",
  },
  {
    id: "accessories",
    title: "ব্যাগ ও লেডিস এক্সেসরিজ",
    subtitle: "Luxury Bags & Clutches",
    count: "স্টাইলিশ হ্যান্ডব্যাগ",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    badge: "ট্রেন্ডি",
    tag: "স্টাইল",
  },
  {
    id: "beauty",
    title: "বিউটি, স্কিনকেয়ার ও গিফট",
    subtitle: "Cosmetics & Fragrance",
    count: "সৌন্দর্য ও উপহার সামগ্রী",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    badge: "জনপ্রিয়",
    tag: "কেয়ার",
  },
];

// Actual featured products with verified pricing and instant WhatsApp ordering
const PRODUCTS = [
  {
    id: "1",
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 2250,
    originalPrice: 2650,
    discount: "১৫% ছাড়",
    rating: 5.0,
    reviews: 48,
    badge: "সেরা বিক্রিত",
    highlight: "স্বচ্ছ গ্লাস ডোর • সিকিউরিটি লক ও চাবি • ১৪০ ডজন ধারণক্ষমতা",
    size: "২১\" x ১৬\" সাইজ",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'ডাবল ডোর কাঠের চুড়ি আলনা (২২৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "2",
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    category: "হোম মন্দির ও ডেকোর",
    categorySlug: "home-decor",
    price: 3450,
    originalPrice: 4200,
    discount: "১৮% ছাড়",
    rating: 4.9,
    reviews: 32,
    badge: "কাস্টমাইজড",
    highlight: "সুক্ষ্ম লেজার কাটিং • ইন-বিল্ট এলইডি লাইট • এক্রিলিক প্রোটেকশন",
    size: "২৪\" x ১৮\" ওয়াল মাউন্ট",
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'কাস্টমাইজড উডেন হোম মন্দির (৩৪৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "3",
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 580,
    originalPrice: 720,
    discount: "২০% ছাড়",
    rating: 4.9,
    reviews: 65,
    badge: "নতুন কালেকশন",
    highlight: "ঐতিহ্যবাহী নিখুঁত রেশমি চুড়ি • আকর্ষণীয় মাল্টিকালার কম্বো",
    size: "সাইজ ২.৪, ২.৬, ২.৮ এভেইলেবল",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'রেশমি কাচের চুড়ি কম্বো সেট (৫৮০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "4",
    name: "এম্বিয়েন্ট এলইডি লাইটিংসহ ড্রয়ারযুক্ত রয়্যাল চুড়ি বক্স",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 1950,
    originalPrice: 2350,
    discount: "১৭% ছাড়",
    rating: 4.9,
    reviews: 41,
    badge: "ট্রেন্ডিং",
    highlight: "ওয়ার্ম হোয়াইট এলইডি • আলাদা রিং ও গহনার ড্রয়ার • ভেলভেট কুশন",
    size: "১৮\" x ১৪\" সাইজ",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'এলইডি লাইটিংসহ চুড়ি বক্স (১৯৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "5",
    name: "রয়্যাল মাল্টি-লেয়ার জুয়েলারি ও মেকআপ অর্গানাইজার কেবিনেট",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 1650,
    originalPrice: 1950,
    discount: "১৫% ছাড়",
    rating: 4.8,
    reviews: 27,
    badge: "জনপ্রিয়",
    highlight: "পার্টিশন ট্রে • ডাবল লক সুবিধা • উন্নতমানের মেহগনি উড ফিনিশ",
    size: "১৬\" x ১২\" সাইজ",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'মাল্টি-লেয়ার জুয়েলারি অর্গানাইজার (১৬৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "6",
    name: "হ্যান্ডক্রাফটেড ফেয়ারি লাইট গ্লাস বোটল ডেকোর শোপিস",
    category: "শোপিস ও লাইটিং",
    categorySlug: "lighting",
    price: 450,
    originalPrice: 550,
    discount: "১৮% ছাড়",
    rating: 4.7,
    reviews: 19,
    badge: "গিফট চয়েস",
    highlight: "ঘরের কর্নার বা বেডরুম সাজানোর জন্য আকর্ষণীয় ফেয়ারি লাইট শোপিস",
    size: "স্ট্যান্ডার্ড ওয়াইন বোটল সাইজ",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'ফেয়ারি লাইট গ্লাস বোটল শোপিস (৪৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "7",
    name: "ঐতিহ্যবাহী গোল্ড-প্লেটেড ব্রাইডাল বালা ও চুড়ি সেট",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 1150,
    originalPrice: 1450,
    discount: "২১% ছাড়",
    rating: 4.9,
    reviews: 52,
    badge: "ব্রাইডাল স্পেশাল",
    highlight: "দীর্ঘস্থায়ী গোল্ড কালার ফিনিশ • ঐতিহ্যবাহী কারুকাজ ও কুন্দন স্টাইল",
    size: "স্ট্যান্ডার্ড সাইজ কম্বো",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'গোল্ড-প্লেটেড ব্রাইডাল বালা সেট (১১৫০ টাকা)' অর্ডার করতে চাই।",
  },
  {
    id: "8",
    name: "ডিজাইনার এমব্রয়ডারি উৎসব কুর্তি ও থ্রি-পিস সেট",
    category: "পোশাক ও কুর্তি",
    categorySlug: "clothing",
    price: 1850,
    originalPrice: 2200,
    discount: "১৬% ছাড়",
    rating: 4.8,
    reviews: 38,
    badge: "এক্সক্লুসিভ",
    highlight: "১০০% প্রিমিয়াম সুতি ফেব্রিক • আকর্ষণীয় হাতের কাজ ও জর্জেট ওড়না",
    size: "M, L, XL, XXL এভেইলেবল",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    whatsappMsg: "আমি 'ডিজাইনার উৎসব কুর্তি সেট (১৮৫০ টাকা)' অর্ডার করতে চাই।",
  },
];

// Customer Testimonials based on authentic Facebook feedback
const TESTIMONIALS = [
  {
    name: "রাবেয়া মজুমদার পপি",
    location: "কুমিল্লা সদর",
    comment: "মাশাল্লাহ আপু! চুড়ি আলনাটা হাতে পেয়েছি। কাঠের নিখুঁত ফিনিশিং আর কাঁচের কাজটা অসাধারণ হয়েছে। রাতের বেলা এলইডি লাইট জ্বালালে পুরো ড্রেসিং রুম আলোকিত হয়ে ওঠে।",
    rating: 5,
    product: "ডাবল ডোর চুড়ি আলনা",
  },
  {
    name: "ইয়াসমিন আক্তার",
    location: "মিরপুর, ঢাকা",
    comment: "প্যাকেজিং অনেক বেশি সুরক্ষিত ছিল, কোনো প্রকার কাঁচের ক্ষতি হয়নি। পুরো ১৪০ ডজন চুড়ি গুছিয়ে রাখতে পেরেছি। কুরিয়ারও খুব দ্রুত পেয়েছি। ধন্যবাদ নারী নিবেদিত!",
    rating: 5,
    product: "১৪০ ডজন চুড়ি আলনা",
  },
  {
    name: "ফাহমিদা সুলতানা",
    location: "জিইসি মোড়, চট্টগ্রাম",
    comment: "হোম মন্দিরটা একদম ছবির চেয়েও বাস্তবে অনেক সুন্দর! ব্যাকলিট ওম আর গণেশের খোদাই করা নকশাটা ঘরের শান্তিময় পরিবেশ তৈরি করেছে। অনেক অনেক শুভকামনা।",
    rating: 5,
    product: "কাস্টমাইজড উডেন মন্দির",
  },
];

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

  const filteredProducts = selectedFilter === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.categorySlug === selectedFilter);

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">

      {/* ========================================================= */}
      {/* 1. LUXURY HERO BANNER WITH BRAND VISUALS                  */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#400717] via-[#5C0D24] to-[#300511] text-white">
        {/* Glow and subtle artistic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(212,175,55,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-80 sm:w-96 h-80 sm:h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              
              {/* Brand Tagline Badge */}
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#FBEBB5] shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>নারীর সৌন্দর্য, রুচি ও ভালোবাসার বিশ্বস্ত ঠিকানা</span>
              </div>

              {/* Catchy Bengali Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.18] font-serif">
                সৌন্দর্য ও রুচির ছোঁয়ায় <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0F3] via-[#F3DE9C] to-[#FFF0F3]">
                  নারী নিবেদিত
                </span>
              </h1>

              {/* High-converting description */}
              <p className="text-rose-100/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                আপনার প্রিয় চুড়ি, অলংকার ও গৃহকোণ সাজাতে হস্তনির্মিত সেরা মানের কাঠের <strong>চুড়ি আলনা</strong>, এলইডি ব্যাকলিট <strong>হোম মন্দির</strong>, ঐতিহ্যবাহী <strong>চুড়ি ও গহনা</strong> এবং ট্রেন্ডি <strong>ফ্যাশন কালেকশন</strong>।
              </p>

              {/* Bullet Features with Icons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs text-rose-200 pt-1 font-medium">
                <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37]" /> ১০০% আসল কাঠের তৈরি
                </span>
                <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37]" /> ১৪০+ ডজন ধারণক্ষমতা
                </span>
                <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-full border border-rose-300/20 backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37]" /> ক্যাশ অন ডেলিভারি
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-2">
                <a
                  href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40 rounded-full px-6 sm:px-7 h-12 text-sm sm:text-base gap-2 transition-transform hover:scale-102">
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span>WhatsApp-এ অর্ডার</span>
                  </Button>
                </a>

                <Link href="/products">
                  <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c29e2e] text-[#4A0A1C] font-bold shadow-lg shadow-amber-950/30 rounded-full px-6 sm:px-7 h-12 text-sm sm:text-base gap-2 transition-transform hover:scale-102">
                    <ShoppingBag className="h-5 w-5" />
                    <span>সব কালেকশন দেখুন</span>
                  </Button>
                </Link>

                <a href="tel:01614258804" className="inline-block">
                  <Button size="lg" variant="outline" className="border-rose-300/40 bg-white/10 text-white hover:bg-white/20 rounded-full px-5 h-12 text-sm gap-2">
                    <Phone className="h-4 w-4 text-[#D4AF37]" />
                    <span>০১৬১৪-২৫৮৮০৪</span>
                  </Button>
                </a>
              </div>

              {/* Social proof counters */}
              <div className="pt-4 sm:pt-6 border-t border-rose-800/60 flex items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs text-rose-200">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">২৫,০০০+</div>
                  <div className="text-[11px] text-rose-300">ফেসবুক ফলোয়ার্স</div>
                </div>
                <div className="h-8 w-px bg-rose-700/60" />
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">৪.৯ ★</div>
                  <div className="text-[11px] text-rose-300">গ্রাহক সন্তুষ্টি রিভিউ</div>
                </div>
                <div className="h-8 w-px bg-rose-700/60" />
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">৬৪ জেলায়</div>
                  <div className="text-[11px] text-rose-300">হোম ডেলিভারি</div>
                </div>
              </div>
            </div>

            {/* Right Visual Showcase Card with Real Brand Assets */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Decorative glowing card frame */}
                <div className="relative rounded-3xl p-3 bg-gradient-to-tr from-[#D4AF37]/50 via-rose-300/20 to-[#D4AF37]/50 shadow-2xl backdrop-blur-md border border-white/20">
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                    
                    {/* Cover banner image preview */}
                    <div className="relative h-56 sm:h-64 w-full">
                      <Image
                        src="/images/cover-banner.png"
                        alt="নারী নিবেদিত কভার ব্যানার"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4">
                        <div className="text-white">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                            অফিসিয়াল ব্র্যান্ড কালেকশন
                          </span>
                          <h3 className="text-sm sm:text-base font-bold">১৪০+ ডজন ধারণক্ষমতার প্রিমিয়াম চুড়ি আলনা</h3>
                        </div>
                      </div>
                    </div>

                    {/* Logo & Highlights below */}
                    <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-[#FFF9FA] text-slate-900 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full border-2 border-[#D4AF37] p-0.5 bg-white shadow-md">
                          <Image
                            src="/images/logo.jpg"
                            alt="নারী নিবেদিত লোগো"
                            fill
                            className="object-contain rounded-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[#6B112B] text-base sm:text-lg leading-tight font-serif">
                            নারী নিবেদিত
                          </h4>
                          <span className="text-xs text-[#B8860B] font-semibold">
                            সৌন্দর্য • রুচি • ভালোবাসা
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
                        <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-100 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-[#6B112B]" />
                          <span>লক ও চাবি সিস্টেম</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-100 flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                          <span>ওয়ার্ম এলইডি লাইটিং</span>
                        </div>
                        <div className="p-2 rounded-lg bg-pink-50/80 border border-pink-100 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-pink-600" />
                          <span>নিরাপদ গ্লাস ডোর</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>ক্যাশ অন ডেলিভারি</span>
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
      {/* 2. THE FACEBOOK COVER TRUST RIBBON (5 Signature Pillars)  */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-100/90 shadow-xl p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-rose-100">
            
            {/* 1. Authentic */}
            <div className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#6B112B] shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">খাঁটি পণ্য</h4>
                <p className="text-[11px] text-slate-500">১০০% আসল কাঠের হস্তশিল্প</p>
              </div>
            </div>

            {/* 2. Best Quality */}
            <div className="flex items-center gap-3 p-2 pt-3 md:pt-2 md:pl-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#B8860B] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">সেরা মান</h4>
                <p className="text-[11px] text-slate-500">টেকসই পলিশ ও মজবুত কাঁচ</p>
              </div>
            </div>

            {/* 3. Fast Delivery */}
            <div className="flex items-center gap-3 p-2 pt-3 md:pt-2 md:pl-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">দ্রুত ডেলিভারি</h4>
                <p className="text-[11px] text-slate-500">সারাদেশে সুরক্ষিত হোম কুরিয়ার</p>
              </div>
            </div>

            {/* 4. Cash on Delivery */}
            <div className="flex items-center gap-3 p-2 pt-3 md:pt-2 md:pl-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[11px] text-slate-500">পণ্য হাতে পেয়ে নিশ্চিন্তে টাকা দিন</p>
              </div>
            </div>

            {/* 5. 24/7 Trusted Service */}
            <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-2 pt-3 md:pt-2 md:pl-4">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#6B112B] shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">বিশ্বস্ত গ্রাহক সেবা</h4>
                <p className="text-[11px] text-slate-500">০১৬১৪-২৫৮৮০৪ সার্বক্ষণিক সাপোর্ট</p>
              </div>
            </div>

          </div>

          {/* Slogan Banner Footer */}
          <div className="mt-4 pt-3 border-t border-rose-100 text-center">
            <span className="text-xs font-semibold text-[#6B112B]">
              🌸 ভালোবাসা দিয়ে তৈরি, আপনার জন্য নিবেদিত ♡
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. OFFICIAL 8 FB CATEGORIES (Visual Cards Grid)           */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full mb-2 border border-rose-200">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> অফিসিয়াল ক্যাটাগরি
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              পছন্দের ক্যাটাগরি বেছে নিন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আপনার রুচি ও প্রয়োজন অনুযায়ী নারী নিবেদিতের সম্পূর্ণ বিশেষ কালেকশন
            </p>
          </div>

          <Link href="/products" className="text-sm font-bold text-[#6B112B] hover:text-[#50091D] flex items-center gap-1 group">
            সকল ক্যাটাগরি দেখুন <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-rose-100/90 shadow-sm hover:shadow-xl hover:border-[#6B112B]/40 transition-all flex flex-col justify-end min-h-[200px] sm:min-h-[230px] bg-slate-900"
            >
              {/* Background Realistic Image */}
              <div className="absolute inset-0">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:via-black/50 transition-colors" />
              </div>

              {/* Category Info */}
              <div className="relative z-10 p-4 space-y-1 text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#F5E6B3] bg-[#6B112B]/85 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 backdrop-blur-sm mb-1">
                  {cat.badge}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#F5E6B3] transition-colors leading-tight">
                  {cat.title}
                </h3>
                <span className="text-[11px] text-rose-200/90 font-medium">
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. REALISTIC FEATURED PRODUCTS (Instant WhatsApp Order)   */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full mb-2 border border-rose-200">
              <Award className="h-3.5 w-3.5 text-[#D4AF37]" /> সর্বাধিক বিক্রিত পণ্য
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              গ্রাহকদের সেরা পছন্দের কালেকশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              হাতে তৈরি নিখুঁত চুড়ি আলনা, হোম মন্দির, ঐতিহ্যবাহী চুড়ি ও এক্সক্লুসিভ জুয়েলারি
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: "all", label: "সব পণ্য" },
              { id: "churi-alna", label: "চুড়ি আলনা" },
              { id: "home-decor", label: "হোম মন্দির" },
              { id: "jewellery", label: "চুড়ি ও গহনা" },
              { id: "lighting", label: "শোপিস ও লাইটিং" },
              { id: "clothing", label: "পোশাক" },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={selectedFilter === f.id ? "default" : "outline"}
                onClick={() => setSelectedFilter(f.id)}
                className={`rounded-full text-xs h-8 ${
                  selectedFilter === f.id 
                    ? "bg-[#6B112B] hover:bg-[#50091D] text-white" 
                    : "border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-[#6B112B]"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl border border-rose-100/90 bg-white overflow-hidden hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Visual Container */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Badge */}
                <Badge className="absolute top-3.5 left-3.5 bg-[#6B112B] text-white font-medium text-xs shadow-md border-0">
                  {product.badge}
                </Badge>

                {/* Discount Tag */}
                {product.discount && (
                  <span className="absolute top-3.5 right-3.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {product.discount}
                  </span>
                )}

                {/* Size / Dimensions Tag */}
                <div className="absolute bottom-3 left-3.5 bg-black/75 text-[#F5E6B3] text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm font-medium border border-white/10">
                  {product.size}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B112B] font-bold tracking-wide">{product.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviews})</span>
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#6B112B] transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.highlight}
                  </p>
                </div>

                {/* Price and Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#6B112B]">৳{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="ml-2 text-xs text-slate-400 line-through">
                          ৳{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      ইন স্টক
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Direct WhatsApp Instant Order Button */}
                    <a
                      href={`https://wa.me/8801614258804?text=${encodeURIComponent(product.whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 rounded-xl h-10 shadow-sm">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>অর্ডার করুন</span>
                      </Button>
                    </a>

                    {/* View Details */}
                    <Link href={`/products/${product.id}`} className="w-full">
                      <Button size="sm" variant="outline" className="w-full border-rose-200 hover:bg-rose-50 text-[#6B112B] font-semibold text-xs rounded-xl h-10">
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> বিস্তারিত
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link href="/products">
            <Button size="lg" className="bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-full px-8 shadow-md">
              সব কালেকশন একসাথে দেখুন <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SPOTLIGHT: কেন নারী নিবেদিতের চুড়ি আলনা সেরা?           */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF5F7] border border-rose-200 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-[#6B112B] text-white text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> হস্তশিল্পের অনন্য নিদর্শন
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#6B112B] tracking-tight font-serif leading-tight">
                কেন নারী নিবেদিতের <br />
                <span className="text-[#B8860B]">কাঠের চুড়ি আলনা</span> গ্রাহকদের এত প্রিয়?
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                আপনার মূল্যবান কাচের, রেশমি ও ধাতব চুড়িগুলো ঘরের কোণে এলোমেলো না রেখে সাজিয়ে রাখুন পরিপাটি ও নিরাপদে। নারী নিবেদিতের প্রতিটি চুড়ি আলনা তৈরি করা হয় দক্ষ কারিগরের নিখুঁত হাতে।
              </p>

              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#6B112B] shrink-0 font-bold text-sm">
                    ১
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">স্বচ্ছ গ্লাস ডোর ও সিকিউরিটি লক</h4>
                    <p className="text-xs text-slate-500 mt-0.5">বাইরে থেকে পছন্দের চুড়ি দেখা যায় এবং তালা দিয়ে নিরাপদে বন্ধ করে রাখা যায়।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-[#B8860B] shrink-0 font-bold text-sm">
                    ২
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">১৪০+ ডজন চুড়ির বিশাল ধারণক্ষমতা</h4>
                    <p className="text-xs text-slate-500 mt-0.5">সহজেই বের করা ও ঢুকানো যায় এমন মসৃণ কাঠের স্টিক সমৃদ্ধ বহুস্তর ড্রয়ার।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 font-bold text-sm">
                    ৩
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ইন-বিল্ট অ্যাম্বিয়েন্ট এলইডি লাইটিং</h4>
                    <p className="text-xs text-slate-500 mt-0.5">রাতের বেলা আলো জ্বালালে পুরো ড্রেসিং কর্নার বা শোকেস মোহনীয় রূপ ধারণ করে।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold text-sm">
                    ৪
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">কাস্টমাইজড মাপ ও পলিশ সুবিধা</h4>
                    <p className="text-xs text-slate-500 mt-0.5">আপনার রুমের খালি জায়গা অনুযায়ী মেহগনি বা সেগুন কাঠের বিশেষ সাইজে বানিয়ে নেওয়ার সুযোগ।</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20customize%20a%20Churi%20Alna"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-full px-7 shadow-lg">
                    <MessageCircle className="mr-2 h-5 w-5 fill-white" />
                    <span>কাস্টমাইজড সাইজে অর্ডার দিতে চ্যাট করুন</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side craftsmanship highlight with real photos */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-xl bg-white p-2">
                <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/gallery.jpg"
                    alt="নারী নিবেদিত কারিগরি কাজ"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                      হাতে তৈরি কাঠের অনন্য শিল্প
                    </span>
                    <h3 className="text-lg font-bold">নিখুঁত কারিগরি যত্ন ও ভালোবাসা দিয়ে তৈরি</h3>
                    <p className="text-xs text-rose-200 mt-1">
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
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> সহজ অর্ডার প্রক্রিয়া
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            ৩টি সহজ ধাপে অর্ডার করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ঝামেলামুক্ত ও নিশ্চিন্তে ঘরে বসেই হোম ডেলিভারিতে পণ্য বুঝে নিন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-[#6B112B] flex items-center justify-center font-black text-lg mx-auto">
              ১
            </div>
            <h4 className="text-base font-bold text-slate-900">পছন্দের পণ্য বেছে নিন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              চুড়ি আলনা, হোম মন্দির বা পছন্দের জুয়েলারি আইটেম সিলেক্ট করুন।
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-[#B8860B] flex items-center justify-center font-black text-lg mx-auto">
              ২
            </div>
            <h4 className="text-base font-bold text-slate-900">WhatsApp বা কলে অর্ডার দিন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              সরাসরি ওয়েবসাইটে বা হোয়াটসঅ্যাপে আপনার নাম, ঠিকানা ও ফোন নম্বর পাঠান।
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm text-center space-y-3 relative">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg mx-auto">
              ৩
            </div>
            <h4 className="text-base font-bold text-slate-900">পণ্য দেখে ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ডেলিভারিম্যানের কাছ থেকে পণ্য বুঝে পেয়ে নিশ্চিন্তে টাকা পরিশোধ করুন।
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REAL CUSTOMER REVIEWS (Facebook Social Proof)          */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Heart className="h-3.5 w-3.5 fill-[#6B112B] text-[#6B112B]" /> গ্রাহকের ভালোবাসা
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            সন্তুষ্ট গ্রাহকদের বাস্তব প্রতিক্রিয়া
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ফেসবুক পেজে আমাদের সম্মানিত ক্রেতাদের বাস্তব মতামত ও ভালোবাসার কিছু স্মৃতি
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-rose-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <span className="text-[10px] text-slate-400">{t.location}</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-[#6B112B] border-rose-200 bg-rose-50/50">
                  {t.product}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                      */}
      {/* ========================================================= */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <HelpCircle className="h-3.5 w-3.5 text-[#D4AF37]" /> আপনার যেকোনো প্রশ্ন
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            সাধারণ জিজ্ঞাসা ও উত্তর
          </h2>
        </div>

        <div className="space-y-3">
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
                  className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 hover:text-[#6B112B] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#6B112B]" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-rose-50 pt-3">
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
        <div className="rounded-3xl bg-gradient-to-r from-[#50091D] via-[#6B112B] to-[#400717] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.22),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#F5E6B3]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> সরাসরি কথা বলুন
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight">
              পছন্দের সাইজ বা ডিজাইনে <br />
              অর্ডার দিতে চান?
            </h2>

            <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
              আপনার ঘরের মাপ বা পছন্দের কালার জানাতে সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন অথবা ফোনে যোগাযোগ করুন। সারা বাংলাদেশে পৌঁছে দেওয়া হবে ক্যাশ অন ডেলিভারিতে।
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <a
                href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full px-7 sm:px-8 h-12 shadow-lg gap-2 text-sm sm:text-base">
                  <MessageCircle className="h-5 w-5 fill-white" />
                  <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
                </Button>
              </a>

              <a href="tel:01614258804">
                <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c29e2e] text-[#4A0A1C] font-bold rounded-full px-7 sm:px-8 h-12 shadow-lg gap-2 text-sm sm:text-base">
                  <Phone className="h-5 w-5" />
                  <span>০১৬১৪-২৫৮৮০৪ নম্বরে কল করুন</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. STICKY MOBILE CONVERSION BAR                          */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-200 p-2.5 sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:01614258804"
            className="flex items-center justify-center gap-1.5 bg-rose-50 text-[#6B112B] font-bold text-xs py-2.5 rounded-xl border border-rose-200"
          >
            <Phone className="h-4 w-4" />
            <span>কল করুন</span>
          </a>

          <a
            href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            <span>WhatsApp অর্ডার</span>
          </a>
        </div>
      </div>

    </div>
  );
}
