"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  Share2, 
  Check, 
  Minus, 
  Plus,
  ShoppingBag,
  MessageCircle,
  MessageSquare,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsSection } from "@/components/reviews-section";
import { QuickOrderModal, type QuickOrderProduct } from "@/components/quick-order-modal";
import { toast } from "sonner";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          const p = json.data;
          setProduct(p);
          const initialImg = p.image || (Array.isArray(p.secondaryImages) && p.secondaryImages[0]) || "";
          setSelectedImage(initialImg);
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        if (isMounted) setProduct(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 bg-slate-200" />
          <Skeleton className="h-4 w-20 bg-slate-200" />
          <Skeleton className="h-4 w-40 bg-indigo-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-3xl bg-slate-200/60" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-square rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-28 rounded-full bg-indigo-100" />
              <Skeleton className="h-8 w-4/5 rounded-lg bg-slate-200" />
              <Skeleton className="h-8 w-3/5 rounded-lg bg-slate-200" />
              <Skeleton className="h-4 w-36 rounded-md bg-amber-100" />
            </div>

            <Skeleton className="h-20 w-full rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-slate-100" />
              <Skeleton className="h-4 w-5/6 bg-slate-100" />
              <Skeleton className="h-4 w-2/3 bg-slate-100" />
            </div>

            <div className="space-y-3 pt-2">
              <Skeleton className="h-14 w-full rounded-2xl bg-indigo-100/80" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 rounded-xl bg-emerald-100" />
                <Skeleton className="h-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-serif">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">
            সম্ভবত পণ্যটি সরিয়ে নেওয়া হয়েছে অথবা লিংকটি ভুল। অনুগ্রহ করে পণ্য সম্ভার চেক করুন।
          </p>
        </div>
        <Link href="/products">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            সব পণ্য দেখুন
          </Button>
        </Link>
      </div>
    );
  }

  const imagesList: string[] = [
    product.image,
    ...(Array.isArray(product.secondaryImages) ? product.secondaryImages : []),
  ].filter(Boolean);

  const displayImage = selectedImage || imagesList[0] || "/images/products/churi-alna.jpg";

  const featuresList: string[] = product.features && Array.isArray(product.features)
    ? product.features
    : product.highlight
    ? product.highlight.split("•").map((f: string) => f.trim()).filter(Boolean)
    : ["১০০% কোয়ালিটি নিশ্চয়তা", "নিরাপদ প্যাকেজিং", "ক্যাশ অন ডেলিভারি"];

  const whatsappOrderUrl = `https://wa.me/8801614258804?text=${encodeURIComponent(
    `Hello Nari Nibedito, I want to order ${product.name} (Quantity: ${quantity}, Price: ৳${(product.price * quantity).toLocaleString()}).`
  )}`;

  const quickOrderProductData: QuickOrderProduct = {
    id: product.id || product._id || productId,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: displayImage,
    size: product.size,
    sku: product.sku,
    category: product.category,
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-8 sm:space-y-10 pb-24 lg:pb-10 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-indigo-600 shrink-0">হোম</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/products" className="hover:text-indigo-600 shrink-0">পণ্য সম্ভার</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-indigo-600 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Left: Product Images */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden bg-slate-100 shadow-lg">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
              priority
            />
            {product.category && (
              <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/90 text-white font-medium text-xs shadow-md border-0">
                {product.category}
              </Badge>
            )}
            {product.badge && (
              <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-500 text-white font-medium text-xs shadow-md border-0">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex sm:grid sm:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
              {imagesList.map((imgUrl: string, index: number) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative h-16 w-16 sm:h-auto sm:w-auto sm:aspect-square shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${
                    displayImage === imgUrl ? "border-indigo-600 shadow-md scale-102" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase Actions */}
        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-indigo-700 border-indigo-200 bg-indigo-50/60 font-semibold text-xs">
                {product.category}
              </Badge>
              {product.sku && <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center text-amber-500 font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating || "5.0"}</span>
              <span className="text-xs text-slate-500">({product.reviews || 0} জন গ্রাহকের রিভিউ)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
            <span className="text-2xl sm:text-4xl font-black text-slate-900">
              ৳{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm sm:text-base text-slate-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.discount ? (
              <Badge className="bg-indigo-600 text-white text-xs">{product.discount}</Badge>
            ) : (
              <Badge className="bg-indigo-600 text-white text-xs">বিশেষ অফার</Badge>
            )}
          </div>

          {/* Short description */}
          {product.description && (
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          )}

          {/* Highlights checklist */}
          {featuresList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              {featuresList.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              পরিমাণ (Quantity)
            </label>
            <div className="flex flex-wrap items-center gap-3">
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-13 sm:h-14 rounded-2xl shadow-xl shadow-indigo-950/20 gap-2.5 text-sm sm:text-base active:scale-[0.99] transition-all cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5 text-amber-300" />
              <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
            </Button>

            {/* Secondary actions: WhatsApp Order & Inquiry, Reviews, Share */}
            <div className="grid grid-cols-1 sm:flex sm:flex-row gap-2.5">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 sm:h-12 rounded-xl shadow-md gap-2 text-xs sm:text-sm"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>হোয়াটসঅ্যাপে অর্ডার / তথ্য</span>
                </Button>
              </a>

              <div className="flex items-center gap-2">
                <a href="#reviews-section" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold h-11 sm:h-12 rounded-xl gap-2 text-xs sm:text-sm"
                  >
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    <span>মতামত ও রিভিউ ({product.reviews || 0})</span>
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
                  className="border-slate-200 text-slate-700 hover:bg-indigo-50 h-11 sm:h-12 w-11 sm:w-12 p-0 rounded-xl shrink-0"
                  title="লিংক শেয়ার করুন"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="border-t border-slate-200 pt-5 space-y-2.5">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Truck className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>সুরক্ষিত কাঠের প্যাকিংয়ে নিরাপদে কুরিয়ার করা হয়</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Phone className="h-4 w-4 text-amber-500 shrink-0" />
              <span>সরাসরি অর্ডার করতে কল করুন: <strong>01614-258804</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details */}
      {(product.material || product.size || product.capacity || product.category) && (
        <div className="border-t border-slate-200 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">পণ্যের বৈশিষ্ট্য ও বিবরণ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
            {product.category && (
              <div className="flex justify-between py-2 border-b border-slate-100 gap-2">
                <span className="text-slate-500">ক্যাটাগরি</span>
                <span className="font-semibold text-slate-900 text-right">{product.category}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between py-2 border-b border-slate-100 gap-2">
                <span className="text-slate-500">সাইজ / পরিমাপ</span>
                <span className="font-semibold text-slate-900 text-right">{product.size}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between py-2 border-b border-slate-100 gap-2">
                <span className="text-slate-500">মেটেরিয়াল ও ফিনিশিং</span>
                <span className="font-semibold text-slate-900 text-right">{product.material}</span>
              </div>
            )}
            {product.capacity && (
              <div className="flex justify-between py-2 border-b border-slate-100 gap-2">
                <span className="text-slate-500">ধারণক্ষমতা</span>
                <span className="font-semibold text-slate-900 text-right">{product.capacity}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Reviews & Feedback Section */}
      <div id="reviews-section" className="border-t border-slate-200 pt-6 sm:pt-8">
        <ReviewsSection productId={product.id || product._id || productId} productTitle={product.name} />
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_-6px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block leading-none">মূল্য ({quantity}টি)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900">
                ৳{((product.price || 0) * quantity).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ৳{(product.originalPrice * quantity).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp অর্ডার"
              className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs tap-scale"
            >
              <MessageCircle className="h-5 w-5 fill-white" />
            </a>

            <Button
              onClick={() => setIsOrderModalOpen(true)}
              className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md tap-scale"
            >
              <ShoppingBag className="h-4 w-4 text-amber-300" />
              <span>অর্ডার করুন</span>
            </Button>
          </div>
        </div>
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
