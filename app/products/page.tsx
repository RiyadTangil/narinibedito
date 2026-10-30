"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  Star, 
  ArrowUpDown, 
  MessageCircle, 
  Eye, 
  Heart, 
  Sparkles, 
  ShoppingBag,
  Package,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingInput, FloatingSelect } from "@/components/ui/floating-input";
import { QuickOrderModal, type QuickOrderProduct } from "@/components/quick-order-modal";

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const focusParam = searchParams.get("focus") || "";

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [orderModalProduct, setOrderModalProduct] = useState<QuickOrderProduct | null>(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (focusParam === "search" && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusParam]);

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

  const chipClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap h-10 sm:h-auto px-4 py-2 rounded-full sm:rounded-xl text-xs font-bold transition-all border tap-scale ${
      active
        ? "bg-[#6B112B] text-white border-[#6B112B] shadow-sm"
        : "bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50"
    }`;

  return (
    <div className="container mx-auto px-4 py-5 sm:py-10 space-y-4 sm:space-y-8 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-rose-100 pb-4 sm:pb-6">
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-[#6B112B] tracking-wider uppercase">নারী নিবেদিত শপ</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-0.5 sm:mt-1">
            সকল পণ্য সম্ভার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
            কাঠের চুড়ি আলনা, হোম মন্দির, ঐতিহ্যবাহী চুড়ি ও ফ্যাশন পোশাকের এক্সক্লুসিভ সমাহার
          </p>
        </div>

        <div className="grid grid-cols-1 sm:flex w-full md:w-auto items-center gap-2.5">
          {/* Floating Search Box */}
          <div className="w-full sm:w-64">
            <FloatingInput
              ref={searchInputRef}
              label="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Floating Sort Selector + WhatsApp */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-52">
              <FloatingSelect
                label="সাজান (Sort By)"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                icon={<ArrowUpDown className="h-4 w-4" />}
              >
                <option value="default">ডিফল্ট তালিকা</option>
                <option value="price-asc">কম থেকে বেশি মূল্য</option>
                <option value="price-desc">বেশি থেকে কম মূল্য</option>
              </FloatingSelect>
            </div>

            <a
              href="https://wa.me/8801614258804?text=Hello%20Nari%20Nibedito,%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button size="sm" className="h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs gap-1.5 px-3.5 shadow-sm tap-scale">
                <MessageCircle className="h-4 w-4 fill-white" />
                <span className="hidden xs:inline">WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Skeleton when loading) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={`cat-chip-skel-${idx}`} className="h-10 w-28 rounded-full shrink-0 bg-rose-100/60" />
          ))
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={chipClass(activeCategory === "all")}
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
                  className={chipClass(activeCategory === cat.id)}
                >
                  {cat.title} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`shop-skel-${idx}`}
              className="rounded-2xl sm:rounded-[28px] border border-rose-100 bg-white p-2 sm:p-3.5 shadow-xs space-y-3"
            >
              <Skeleton className="aspect-square sm:aspect-[4/5] w-full rounded-xl sm:rounded-2xl bg-rose-100/50" />
              <div className="space-y-2 px-1">
                <div className="hidden sm:flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-20 rounded-full bg-rose-100/60" />
                  <Skeleton className="h-4 w-12 rounded-full bg-amber-100/60" />
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
      ) : sortedProducts.length === 0 ? (
        <div className="py-16 sm:py-20 text-center max-w-sm mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-200 text-[#6B112B] mx-auto flex items-center justify-center">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? `"${searchQuery}" এর জন্য কোনো ফলাফল নেই` : "এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় পণ্য নেই"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="h-10 rounded-xl border-rose-200 text-[#6B112B] text-xs"
          >
            সব পণ্য দেখুন
          </Button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
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
            const whatsappInfoUrl = `https://wa.me/8801614258804?text=${encodeURIComponent(
              `হ্যালো নারী নিবেদিত, আমি '${product.name}' সম্পর্কে বিস্তারিত তথ্য জানতে চাই।`
            )}`;

            return (
              <div
                key={prodId}
                className="group relative min-w-0 rounded-2xl sm:rounded-[28px] border border-rose-100/90 bg-white p-2 sm:p-3.5 shadow-[0_4px_20px_-4px_rgba(107,17,43,0.06)] lg:hover:shadow-[0_20px_40px_-12px_rgba(107,17,43,0.18)] lg:hover:border-rose-300 transition-all duration-500 flex flex-col justify-between lg:hover:-translate-y-1.5"
              >
                {/* Inset Rounded Image Container */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 sm:from-black/65 via-black/5 sm:via-black/15 to-transparent pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Left: Boutique Badge */}
                  {product.badge && (
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10 max-w-[70%] pointer-events-none">
                      <span className="inline-flex items-center gap-1 bg-[#6B112B]/90 backdrop-blur-md text-[#F5E6B3] border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md truncate max-w-full">
                        <Sparkles className="h-2.5 w-2.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{product.badge}</span>
                      </span>
                    </div>
                  )}

                  {/* Top Right: Wishlist Heart Button */}
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm flex items-center justify-center transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-1 lg:group-hover:translate-y-0"
                  >
                    <Heart className="h-4 w-4 fill-transparent hover:fill-rose-600 transition-colors" />
                  </button>

                  {/* Bottom Left: Size / Specs */}
                  {product.size && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-10 max-w-[85%] pointer-events-none">
                      <div className="bg-black/70 backdrop-blur-md text-[#FBEBB5] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/15 shadow-sm truncate">
                        {product.size}
                      </div>
                    </div>
                  )}

                  {/* Hover Quick Action (desktop only) */}
                  <Link
                    href={`/products/${prodId}`}
                    className="absolute inset-x-3 bottom-3 z-20 hidden lg:group-hover:flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md text-[#6B112B] font-bold text-xs py-2 rounded-xl shadow-lg border border-rose-200/80 transition-all duration-300"
                  >
                    <Eye className="h-3.5 w-3.5" /> বিস্তারিত দেখুন
                  </Link>
                </div>

                {/* Details Section */}
                <div className="pt-2 sm:pt-3.5 pb-0 sm:pb-1 px-0.5 sm:px-1 flex-1 flex flex-col justify-between gap-2 sm:gap-3.5 min-w-0">
                  <div className="space-y-1 sm:space-y-2 min-w-0">
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

                    <Link href={`/products/${prodId}`} className="block group/title">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover/title:text-[#6B112B] transition-colors line-clamp-2 leading-snug font-serif">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Compact rating (mobile) */}
                    <div className="flex sm:hidden items-center gap-1 text-[11px] font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating || "5.0"}</span>
                      <span className="text-slate-400 font-normal">({product.reviews || 0})</span>
                    </div>

                    {product.description && (
                      <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="pt-2 sm:pt-2.5 border-t border-rose-100/80 space-y-2 sm:space-y-3">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                        <span className="text-base sm:text-2xl font-black text-[#6B112B] tracking-tight">
                          ৳{product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                            ৳{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ইন স্টক
                      </div>
                    </div>

                    {/* Mobile actions: full-width order + WhatsApp icon */}
                    <div className="flex sm:hidden items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => setOrderModalProduct(quickOrderData)}
                        className="flex-1 min-w-0 h-9 bg-[#6B112B] hover:bg-[#50091D] text-white font-bold text-xs gap-1 rounded-xl shadow-sm active:scale-95 border-0 px-2"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">অর্ডার</span>
                      </Button>
                      <a
                        href={whatsappInfoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp এ তথ্য জানুন"
                        className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                      </a>
                    </div>

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

      {/* Quick Cash-on-Delivery Order Modal */}
      <QuickOrderModal
        product={orderModalProduct}
        isOpen={!!orderModalProduct}
        onClose={() => setOrderModalProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-rose-100" />
            <Skeleton className="h-8 w-56 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl bg-rose-100/50" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
