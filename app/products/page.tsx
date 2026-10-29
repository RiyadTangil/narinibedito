"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  Star, 
  Filter, 
  ArrowUpDown, 
  MessageCircle, 
  Eye, 
  Heart, 
  Sparkles, 
  ShoppingBag,
  Loader2,
  Package,
  Layers,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QuickOrderModal, type QuickOrderProduct } from "@/components/quick-order-modal";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [orderModalProduct, setOrderModalProduct] = useState<QuickOrderProduct | null>(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([productsRes, categoriesRes]) => {
        if (!isMounted) return;
        if (productsRes.success && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
        }
        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load catalog data:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" ||
      p.categorySlug === activeCategory ||
      p.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-6">
        <div>
          <span className="text-xs font-bold text-[#6B112B] tracking-wider uppercase">নারী নিবেদিত শপ</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
            সকল পণ্য সম্ভার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            কাঠের চুড়ি আলনা, হোম মন্দির, ঐতিহ্যবাহী চুড়ি ও ফ্যাশন পোশাকের এক্সক্লুসিভ সমাহার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="pl-9 h-9 text-xs rounded-xl border-rose-200 focus:border-[#6B112B]"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-rose-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#6B112B]"
          >
            <option value="default">মূল্য অনুযায়ী সাজান</option>
            <option value="price-asc">কম থেকে বেশি মূল্য</option>
            <option value="price-desc">বেশি থেকে কম মূল্য</option>
          </select>

          <a
            href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs gap-1.5 shadow-sm">
              <MessageCircle className="h-4 w-4 fill-white" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Category Filter Pills (Dynamically loaded from DB) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeCategory === "all"
              ? "bg-[#6B112B] text-white border-[#6B112B] shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
          }`}
        >
          সব পণ্য ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.categorySlug === cat.id || p.category === cat.title
          ).length;
          return (
            <button
              type="button"
              key={cat.id || cat._id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat.id
                  ? "bg-[#6B112B] text-white border-[#6B112B] shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
              }`}
            >
              {cat.title} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-9 w-9 text-[#6B112B] animate-spin" />
          <p className="text-xs font-medium text-slate-500">পণ্য তালিকা লোড করা হচ্ছে...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 text-[#6B112B] mx-auto flex items-center justify-center">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? `"${searchQuery}" এর জন্য কোনো ফলাফল নেই` : "এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় পণ্য নেই"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="rounded-xl border-rose-200 text-[#6B112B] text-xs"
          >
            সব পণ্য দেখুন
          </Button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {sortedProducts.map((product) => {
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

            return (
              <div
                key={prodId}
                className="group relative rounded-[28px] border border-rose-100/90 bg-white p-3 sm:p-3.5 shadow-[0_4px_20px_-4px_rgba(107,17,43,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(107,17,43,0.18)] hover:border-rose-300 transition-all duration-500 flex flex-col justify-between transform hover:-translate-y-1.5"
              >
                {/* Inset Rounded Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-stone-50 via-rose-50/20 to-stone-100">
                  <Image
                    src={product.image || "/images/products/churi-alna.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Left: Boutique Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 bg-[#6B112B]/90 backdrop-blur-md text-[#F5E6B3] border border-[#D4AF37]/40 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Top Right: Wishlist Heart Button */}
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                  >
                    <Heart className="h-4 w-4 fill-transparent hover:fill-rose-600 transition-colors" />
                  </button>

                  {/* Bottom Left: Size / Specs */}
                  {product.size && (
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="bg-black/70 backdrop-blur-md text-[#FBEBB5] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/15 shadow-sm">
                        {product.size}
                      </div>
                    </div>
                  )}

                  {/* Hover Quick Action */}
                  <Link
                    href={`/products/${prodId}`}
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
                        <span>{product.rating || "5.0"}</span>
                        <span className="text-slate-400 font-normal">({product.reviews || 0})</span>
                      </div>
                    </div>

                    <Link href={`/products/${prodId}`} className="block group/title">
                      <h3 className="font-bold text-base text-slate-900 group-hover/title:text-[#6B112B] transition-colors line-clamp-2 leading-snug font-serif">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="pt-2.5 border-t border-rose-100/80 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#6B112B] tracking-tight">
                          ৳{product.price?.toLocaleString()}
                        </span>
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

      {/* Quick Cash-on-Delivery Order Modal */}
      <QuickOrderModal
        product={orderModalProduct}
        isOpen={!!orderModalProduct}
        onClose={() => setOrderModalProduct(null)}
      />
    </div>
  );
}
