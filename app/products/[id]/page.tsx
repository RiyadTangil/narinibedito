"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart, 
  Share2, 
  Check, 
  Minus, 
  Plus,
  ShoppingBag,
  MessageCircle,
  MessageSquare,
  Phone,
  Sparkles,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReviewsSection } from "@/components/reviews-section";
import { QuickOrderModal, type QuickOrderProduct } from "@/components/quick-order-modal";
import { toast } from "sonner";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

const PRODUCT_DATABASE: Record<string, any> = {
  "1": {
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    category: "চুড়ি আলনা ও বক্স",
    price: 2250,
    originalPrice: 2650,
    rating: 5.0,
    reviews: 48,
    sku: "NN-ALNA-01",
    size: "২১\" x ১৬\" সাইজ",
    material: "উন্নতমানের পালিশ করা কাঠ ও স্বচ্ছ গ্লাস",
    capacity: "১৪০+ ডজন চুড়ির ধারণক্ষমতা",
    features: ["সিকিউরিটি লক ও চাবি", "স্বচ্ছ কাঁচের পাল্লা", "স্মুথ স্লাইডিং উডেন রড", "সহজে পরিষ্কারযোগ্য"],
    images: [
      "/images/products/churi-alna.jpg",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80"
    ],
    description: "আপনার প্রিয় চুড়ি ও গহনাগুলো নিরাপদে সাজিয়ে রাখতে নারী নিবেদিতের তৈরি প্রিমিয়াম ডাবল ডোর চুড়ি আলনা। বাইরে থেকে পুরো কালেকশন দৃশ্যমান থাকে এবং ধুলাবালি থেকে মুক্ত থাকে। লক ও কি থাকায় মূল্যবান অলংকার থাকে শতভাগ নিরাপদ।"
  },
  "2": {
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    category: "হোম মন্দির ও ডেকোর",
    price: 3450,
    originalPrice: 4200,
    rating: 4.9,
    reviews: 32,
    sku: "NN-MANDIR-02",
    size: "২৪\" x ১৮\" সাইজ",
    material: "এইচডিএফ ও এক্রিলিক ব্যাকলিট উড",
    capacity: "দেয়ালে ঝুলানো বা টেবিলে রাখার উপযোগী",
    features: ["সুক্ষ্ম লেজার কাটিং আর্টওয়ার্ক", "ইন-বিল্ট গোল্ডেন ওয়ার্ম এলইডি লাইট", "প্রার্থনা সামগ্রী রাখার তাক"],
    images: [
      "/images/products/home-mandir.jpg",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
      "/images/products/churi-alna.jpg"
    ],
    description: "ঘরের পবিত্র পরিবেশকে আরও উজ্জ্বল ও নান্দনিক করতে তৈরি এই কাস্টমাইজড উডেন হোম মন্দির। এলইডি আলো ঘরের আধ্যাত্মিক আমেজ বাড়িয়ে দেয়।"
  },
  "3": {
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    category: "জুয়েলারি ও চুড়ি",
    price: 580,
    originalPrice: 720,
    rating: 4.9,
    reviews: 65,
    sku: "NN-CHURI-03",
    size: "সাইজ ২.৪, ২.৬, ২.৮ এভেইলেবল",
    material: "ঐতিহ্যবাহী নিখুঁত রেশমি ও কাচ",
    capacity: "৬০ পিস মাল্টিকালার কম্বো",
    features: ["উজ্জ্বল টেকসই রঙ", "বিয়ে ও উৎসবের জন্য সেরা", "হাতে পরা আরামদায়ক"],
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576014131795-d4501d5218d6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80"
    ],
    description: "যেকোনো শাড়ি বা উৎসবের পোশাকের সাথে মানানসই রেশমি চুড়ির কম্বো সেট। নিখুঁত রঙ ও ঐতিহ্যবাহী কাটিং।"
  }
};

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const product = PRODUCT_DATABASE[productId] || PRODUCT_DATABASE["1"];

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const whatsappOrderUrl = `https://wa.me/8801614258804?text=${encodeURIComponent(
    `Hello Nari Nibedito, I want to order ${product.name} (Quantity: ${quantity}, Price: ৳${product.price * quantity}).`
  )}`;

  const quickOrderProductData: QuickOrderProduct = {
    id: productId,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.images?.[0] || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    size: product.size,
    sku: product.sku,
    category: product.category,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5">
        <Link href="/" className="hover:text-[#8B1E3F]">হোম</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-[#8B1E3F]">পণ্য সম্ভার</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#8B1E3F] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Images with Unsplash */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl border border-rose-100 overflow-hidden bg-slate-100 shadow-lg">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover transition-all duration-300"
              priority
            />
            <Badge className="absolute top-4 left-4 bg-[#8B1E3F] text-white font-medium text-xs shadow-md border-0">
              {product.category}
            </Badge>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((imgUrl: string, index: number) => (
              <button
                type="button"
                key={index}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  selectedImage === imgUrl ? "border-[#8B1E3F] shadow-md scale-102" : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Meta & Purchase Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#8B1E3F] border-rose-200 bg-rose-50/60 font-semibold text-xs">
                {product.category}
              </Badge>
              <span className="text-xs text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-500 font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-500">({product.reviews} জন গ্রাহকের রিভিউ)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-5 rounded-2xl bg-rose-50/40 border border-rose-100">
            <span className="text-3xl sm:text-4xl font-black text-[#7A1233]">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
            <Badge className="bg-[#8B1E3F] text-white text-xs">বিশেষ ছাড়</Badge>
          </div>

          {/* Short description */}
          <p className="text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>

          {/* Highlights checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
            {product.features?.map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              পরিমাণ (Quantity)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                ✓ ইন স্টক (সারাদেশে ক্যাশ অন ডেলিভারি)
              </span>
            </div>
          </div>

          {/* Action Buttons: Direct COD Order + WhatsApp + Feedback/Reviews */}
          <div className="space-y-3 pt-2">
            {/* Primary COD Order Button */}
            <Button
              size="lg"
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#6B112B] via-[#8B1E3F] to-[#9E1B42] hover:from-[#52091E] hover:to-[#6B112B] text-white font-extrabold h-14 rounded-2xl shadow-xl shadow-rose-950/25 gap-3 text-base active:scale-[0.99] transition-all cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
            </Button>

            {/* Secondary actions: WhatsApp Order & Inquiry, Reviews, Share */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-md gap-2"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>হোয়াটসঅ্যাপে অর্ডার / তথ্য</span>
                </Button>
              </a>

              <a href="#reviews-section" className="shrink-0">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-rose-200 text-[#8B1E3F] hover:bg-rose-50 font-bold h-12 rounded-xl gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-[#8B1E3F]" />
                  <span>মতামত ও রিভিউ ({product.reviews || 48})</span>
                </Button>
              </a>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("পণ্যটির লিংক কপি করা হয়েছে!");
                  }
                }}
                className="border-rose-200 text-slate-700 hover:bg-rose-50 h-12 rounded-xl"
                title="লিংক শেয়ার করুন"
              >
                <Share2 className="h-5 w-5 text-[#8B1E3F]" />
              </Button>
            </div>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="border-t border-rose-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Truck className="h-4 w-4 text-[#8B1E3F]" />
              <span>সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>সুরক্ষিত কাঠের প্যাকিংয়ে নিরাপদে কুরিয়ার করা হয়</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Phone className="h-4 w-4 text-[#D4AF37]" />
              <span>সরাসরি অর্ডার করতে কল করুন: <strong>01614-258804</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details */}
      <div className="border-t border-rose-100 pt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 font-serif">পণ্যের বৈশিষ্ট্য ও বিবরণ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
          <div className="flex justify-between py-2.5 border-b border-rose-50">
            <span className="text-slate-500">ক্যাটাগরি</span>
            <span className="font-semibold text-slate-900">{product.category}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-rose-50">
            <span className="text-slate-500">সাইজ / পরিমাপ</span>
            <span className="font-semibold text-slate-900">{product.size}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-rose-50">
            <span className="text-slate-500">মেটেরিয়াল ও ফিনিশিং</span>
            <span className="font-semibold text-slate-900">{product.material}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-rose-50">
            <span className="text-slate-500">ধারণক্ষমতা</span>
            <span className="font-semibold text-slate-900">{product.capacity}</span>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="border-t border-rose-100 pt-8">
        <ReviewsSection productId={productId} productTitle={product.name} />
      </div>

      {/* Quick Order Cash on Delivery Modal */}
      <QuickOrderModal
        product={quickOrderProductData}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialQuantity={quantity}
      />
    </div>
  );
}
