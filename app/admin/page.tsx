"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  Eye, 
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  Store,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { toast } from "sonner";

const STATS = [
  {
    title: "মোট পণ্য তালিকাভুক্ত",
    subtitle: "Total Products",
    value: "৪৮টি",
    change: "+৮টি নতুন এই মাসে",
    icon: Package,
    color: "text-[#6B112B] bg-rose-50 border-rose-200",
  },
  {
    title: "ইন-স্টক ও সক্রিয় পণ্য",
    subtitle: "Active In Stock",
    value: "৪২টি",
    change: "৮৮% পণ্য এভেইলেবল",
    icon: ShoppingBag,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    title: "লো-স্টক সতর্কতা",
    subtitle: "Low Stock Alert",
    value: "৬টি",
    change: "পুনরায় স্টক প্রয়োজন",
    icon: AlertTriangle,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    title: "অফিসিয়াল ক্যাটাগরি",
    subtitle: "Product Categories",
    value: "৮টি",
    change: "ব্যানারের সাথে সিঙ্কড",
    icon: Layers,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
];

// Actual Nari Nibedito inventory items
const RECENT_PRODUCTS: any[] = [];
/*
  {
    id: "1",
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    sku: "NN-ALNA-01",
    category: "চুড়ি আলনা ও শোকেস",
    price: 2250,
    originalPrice: 2650,
    stock: 24,
    status: "Active",
    badge: "সেরা বিক্রিত",
    image: "/images/products/churi-alna.jpg",
  },
  {
    id: "2",
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    sku: "NN-MANDIR-02",
    category: "হোম মন্দির ও ডেকোর",
    price: 3450,
    originalPrice: 4200,
    stock: 12,
    status: "Active",
    badge: "কাস্টমাইজড",
    image: "/images/products/home-mandir.jpg",
  },
  {
    id: "3",
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    sku: "NN-CHURI-03",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    price: 580,
    originalPrice: 720,
    stock: 85,
    status: "Active",
    badge: "নতুন কালেকশন",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "এম্বিয়েন্ট এলইডি লাইটিংসহ ড্রয়ারযুক্ত রয়্যাল চুড়ি বক্স",
    sku: "NN-BOX-04",
    category: "চুড়ি আলনা ও শোকেস",
    price: 1950,
    originalPrice: 2350,
    stock: 5,
    status: "Low Stock",
    badge: "ট্রেন্ডিং",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    name: "হ্যান্ডক্রাফটেড ফেয়ারি লাইট গ্লাস বোটল ডেকোর শোপিস",
    sku: "NN-LIGHT-05",
    category: "শোপিস ও লাইটিং",
    price: 450,
    originalPrice: 550,
    stock: 30,
    status: "Active",
    badge: "গিফট চয়েস",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
  },
];
*/

const CATEGORY_SUMMARY = [
  { name: "চুড়ি আলনা ও শোকেস", count: 14, percent: 30 },
  { name: "হোম মন্দির ও ডেকোর", count: 8, percent: 18 },
  { name: "ঐতিহ্যবাহী চুড়ি ও গহনা", count: 12, percent: 25 },
  { name: "জুয়েলারি বক্স ও কেবিনেট", count: 6, percent: 12 },
  { name: "শোপিস ও ফেয়ারি লাইটিং", count: 8, percent: 15 },
];

export default function AdminDashboardPage() {
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any>({ total: 0, pending: 0, confirmed: 0, totalRevenue: 0 });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const targetParam = productToDelete._id
        ? `_id=${productToDelete._id}`
        : productToDelete.sku
        ? `sku=${productToDelete.sku}`
        : `id=${productToDelete.id}`;

      const res = await fetch(`/api/products?${targetParam}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setRecentProducts((prev) =>
          prev.filter(
            (p) =>
              (p._id && p._id !== productToDelete._id) &&
              (p.sku && p.sku !== productToDelete.sku) &&
              p.id !== productToDelete.id
          )
        );
        toast.success(`"${productToDelete.name}" সফলভাবে ডিলিট করা হয়েছে!`);
      } else {
        toast.error(json.message || "ডিলিট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    // 1. Fetch live orders
    fetch("/api/orders?limit=4")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setLiveOrders(json.data || []);
          if (json.meta?.stats) {
            setOrderStats(json.meta.stats);
          }
        }
      })
      .catch(() => {});

    // 2. Fetch live products from DB
    fetch("/api/products?limit=5")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRecentProducts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Quick Action Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#50091D] via-[#6B112B] to-[#400717] text-white p-6 sm:p-8 shadow-xl border border-rose-300/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.2),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-bold text-[#FBEBB5]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>নারী নিবেদিত এডমিন ড্যাশবোর্ড</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              স্বাগতম, নারী নিবেদিত ম্যানেজমেন্ট!
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              আপনার ই-কমার্স স্টোরের পণ্য তালিকা, নতুন কালেকশন যুক্ত করা, গ্রাহকদের অর্ডার ট্র্যাকিং এবং ক্যাটাগরি সম্পূর্ণ নিয়ন্ত্রণ করুন এক স্থান থেকেই।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/orders">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md gap-2 h-11 text-xs sm:text-sm">
                <ShoppingBag className="h-4 w-4" />
                <span>কাস্টমার অর্ডারসমূহ ({orderStats.total})</span>
              </Button>
            </Link>

            <Link href="/admin/products/add">
              <Button size="lg" className="bg-[#D4AF37] hover:bg-[#c29e2e] text-[#4A0A1C] font-bold rounded-2xl shadow-md gap-2 h-11 text-xs sm:text-sm">
                <PlusCircle className="h-4 w-4" />
                <span>নতুন পণ্য যোগ</span>
              </Button>
            </Link>

            <Link href="/admin/categories">
              <Button size="lg" variant="outline" className="border-rose-300/40 bg-white/10 text-white hover:bg-white/20 rounded-2xl gap-2 h-11 text-xs sm:text-sm">
                <Layers className="h-4 w-4 text-[#D4AF37]" />
                <span>ক্যাটাগরি</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {stat.title}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  <span className="text-xs text-slate-500 block">
                    {stat.change}
                  </span>
                </div>
                <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Incoming Customer Orders Section */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-serif">
                সাম্প্রতিক কাস্টমার অর্ডারসমূহ (Recent Customer Orders)
              </h2>
              <p className="text-xs text-slate-500">
                ওয়েবসাইট থেকে সরাসরি আসা ক্যাশ অন ডেলিভারি অর্ডার
              </p>
            </div>
          </div>

          <Link href="/admin/orders" className="text-xs font-bold text-[#6B112B] hover:underline flex items-center gap-1">
            সকল অর্ডার দেখুন ({orderStats.total}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {liveOrders.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            এখনো কোনো নতুন অর্ডার আসেনি। গ্রাহকরা অর্ডার করলে এখানে সাথে সাথে দেখা যাবে।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {liveOrders.map((ord: any) => (
              <div key={ord._id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white hover:shadow-sm transition-all text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#6B112B] text-[11px]">{ord.orderNumber}</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                    ৳{ord.totalAmount?.toLocaleString()}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 truncate">{ord.customerName}</h4>
                  <span className="text-[11px] text-slate-500 block truncate">{ord.phone}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate border-t border-slate-200/60 pt-1.5 flex items-center justify-between">
                  <span className="truncate max-w-[150px]">{ord.items?.[0]?.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400">× {ord.items?.[0]?.quantity || 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Dashboard Grid (Recent Products + Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Products Catalog (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight font-serif">
                সাম্প্রতিক পণ্যসমূহ (Recent Products)
              </h2>
              <p className="text-xs text-slate-500">
                ওয়েবসাইটে লাইভ থাকা গুরুত্বপূর্ণ কালেকশন ও স্টক
              </p>
            </div>

            <Link href="/admin/products" className="text-xs font-bold text-[#6B112B] hover:underline flex items-center gap-1">
              সকল পণ্য দেখুন <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card className="border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
                  <tr>
                    <th className="py-3 px-4">পণ্য ও ছবি</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">মূল্য</th>
                    <th className="py-3 px-4">স্টক</th>
                    <th className="py-3 px-4 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col max-w-xs">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        <Badge variant="outline" className="bg-rose-50 text-[#6B112B] border-rose-200 font-semibold text-[10px]">
                          {item.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#6B112B] whitespace-nowrap">
                        ৳{item.price.toLocaleString()}
                        <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                          ৳{item.originalPrice.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {item.stock} পিস ({item.status === "Active" ? "ইন-স্টক" : "সীমিত"})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/products/${item.id}`} target="_blank">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-[#6B112B]" title="ওয়েবসাইটে প্রিভিউ দেখুন">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/add?id=${item._id || item.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600" title="এডিট করুন">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setProductToDelete(item)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>মোট ৪৮টি পণ্যের মধ্যে ৫টি প্রদর্শিত হচ্ছে</span>
              <Link href="/admin/products">
                <Button size="sm" variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold">
                  সকল পণ্য তালিকা খুলুন
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column: Category Distribution & Quick Help (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Category Distribution Card */}
          <Card className="border-slate-200/90 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 font-serif">
                  ক্যাটাগরি ভিত্তিক ইনভেন্টরি
                </CardTitle>
                <Link href="/admin/categories" className="text-xs text-[#6B112B] font-bold hover:underline">
                  সবগুলো
                </Link>
              </div>
              <CardDescription className="text-xs">
                কোন ক্যাটাগরিতে কতটি পণ্য লাইভ রয়েছে
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {CATEGORY_SUMMARY.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.name}</span>
                    <span className="text-[#6B112B] font-bold">{cat.count}টি পণ্য</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6B112B] to-[#D4AF37] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-3">
                <Link href="/admin/categories">
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-rose-200 text-[#6B112B] hover:bg-rose-50 text-xs font-bold gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>নতুন ক্যাটাগরি যুক্ত করুন</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Hotline & Order Dispatch Card */}
          <Card className="border-rose-100 bg-gradient-to-br from-white to-rose-50/50 shadow-sm rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6B112B]">
              <MessageCircle className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp হটলাইন সাপোর্ট</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              গ্রাহকদের সরাসরি অর্ডার হটলাইন
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              যেকোনো পণ্য সংক্রান্ত প্রশ্ন বা কাস্টমাইজড অর্ডারের জন্য <strong>০১৬১৪-২৫৮৮০৪</strong> সরাসরি চালু রয়েছে।
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a 
                href="https://wa.me/8801614258804" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full"
              >
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-1.5">
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>হোয়াটসঅ্যাপ ওপেন করুন</span>
                </Button>
              </a>
            </div>
          </Card>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="পণ্যটি ডিলিট করতে চান?"
        description="এই পণ্যটি মুছে ফেললে ওয়েবসাইট ক্যাটালগ ও ইনভেন্টরি থেকে অপসারিত হবে।"
        itemName={productToDelete?.name}
        itemSku={productToDelete?.sku}
        itemImage={productToDelete?.image}
      />
    </div>
  );
}
