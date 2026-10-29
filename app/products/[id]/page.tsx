"use client";

import { use, useState, useEffect } from "react";
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
  Lock,
  Loader2,
  AlertCircle,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 text-[#6B112B] animate-spin" />
        <p className="text-sm font-semibold text-slate-600">পণ্যের তথ্য লোড করা হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md space-y-6">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-50 flex items-center justify-center text-[#6B112B] border border-rose-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-serif">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">
            সম্ভবত পণ্যটি সরিয়ে নেওয়া হয়েছে অথবা লিংকটি ভুল। অনুগ্রহ করে পণ্য সম্ভার চেক করুন।
          </p>
        </div>
        <Link href="/products">
          <Button className="bg-[#6B112B] hover:bg-[#50091D] text-white rounded-xl">
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
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5">
        <Link href="/" className="hover:text-[#6B112B]">হোম</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-[#6B112B]">পণ্য সম্ভার</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#6B112B] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl border border-rose-100 overflow-hidden bg-slate-100 shadow-lg">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-all duration-300"
              priority
            />
            {product.category && (
              <Badge className="absolute top-4 left-4 bg-[#6B112B] text-white font-medium text-xs shadow-md border-0">
                {product.category}
              </Badge>
            )}
            {product.badge && (
              <Badge className="absolute top-4 right-4 bg-amber-500 text-white font-medium text-xs shadow-md border-0">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {imagesList.map((imgUrl: string, index: number) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    displayImage === imgUrl ? "border-[#6B112B] shadow-md scale-102" : "border-slate-200 opacity-70 hover:opacity-100"
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
          )}
        </div>

        {/* Right: Product Meta & Purchase Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#6B112B] border-rose-200 bg-rose-50/60 font-semibold text-xs">
                {product.category}
              </Badge>
              {product.sku && <span className="text-xs text-slate-400">SKU: {product.sku}</span>}
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
              <span className="text-xs font-bold text-slate-800">{product.rating || "5.0"}</span>
              <span className="text-xs text-slate-500">({product.reviews || 0} জন গ্রাহকের রিভিউ)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-5 rounded-2xl bg-rose-50/40 border border-rose-100">
            <span className="text-3xl sm:text-4xl font-black text-[#6B112B]">
              ৳{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.discount ? (
              <Badge className="bg-[#6B112B] text-white text-xs">{product.discount}</Badge>
            ) : (
              <Badge className="bg-[#6B112B] text-white text-xs">বিশেষ অফার</Badge>
            )}
          </div>

          {/* Short description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-slate-600">
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
                  className="w-full sm:w-auto border-rose-200 text-[#6B112B] hover:bg-rose-50 font-bold h-12 rounded-xl gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-[#6B112B]" />
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
                className="border-rose-200 text-slate-700 hover:bg-rose-50 h-12 rounded-xl"
                title="লিংক শেয়ার করুন"
              >
                <Share2 className="h-5 w-5 text-[#6B112B]" />
              </Button>
            </div>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="border-t border-rose-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Truck className="h-4 w-4 text-[#6B112B]" />
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
      {(product.material || product.size || product.capacity || product.category) && (
        <div className="border-t border-rose-100 pt-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-serif">পণ্যের বৈশিষ্ট্য ও বিবরণ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
            {product.category && (
              <div className="flex justify-between py-2.5 border-b border-rose-50">
                <span className="text-slate-500">ক্যাটাগরি</span>
                <span className="font-semibold text-slate-900">{product.category}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between py-2.5 border-b border-rose-50">
                <span className="text-slate-500">সাইজ / পরিমাপ</span>
                <span className="font-semibold text-slate-900">{product.size}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between py-2.5 border-b border-rose-50">
                <span className="text-slate-500">মেটেরিয়াল ও ফিনিশিং</span>
                <span className="font-semibold text-slate-900">{product.material}</span>
              </div>
            )}
            {product.capacity && (
              <div className="flex justify-between py-2.5 border-b border-rose-50">
                <span className="text-slate-500">ধারণক্ষমতা</span>
                <span className="font-semibold text-slate-900">{product.capacity}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Reviews & Feedback Section */}
      <div id="reviews-section" className="border-t border-rose-100 pt-8">
        <ReviewsSection productId={product.id || product._id || productId} productTitle={product.name} />
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
