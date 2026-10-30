"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  RefreshCw,
  Copy,
  User,
  Package,
  Calendar,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingInput } from "@/components/ui/floating-input";
import { 
  ORDER_STATUS, 
  ORDER_STATUS_MAP 
} from "@/lib/constants/order-constants";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
        if (json.meta?.stats) {
          setStats(json.meta.stats);
        }
      } else {
        toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("সার্ভার থেকে অর্ডার আনতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedStatus, searchQuery]);

  const handleUpdateStatus = async (orderId: string, newStatus: number) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে");
        // Update local order list
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        // Refresh stats
        fetchOrders();
      } else {
        toast.error(json.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (e) {
      toast.error("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text);
      toast.success(`${label} কপি করা হয়েছে!`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#6B112B] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> রিয়েল-টাইম অর্ডার ট্র্যাকিং
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif mt-1">
            কাস্টমার অর্ডারসমূহ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ওয়েবসাইট থেকে আগত গ্রাহকদের সকল ক্যাশ অন ডেলিভারি অর্ডারের তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchOrders}
            disabled={loading}
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl h-10 gap-2 text-xs font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">মোট অর্ডার</span>
          <div className="text-lg sm:text-xl font-black text-slate-900">{stats.total}টি</div>
          <span className="text-[10px] text-slate-400">সর্বমোট প্লেসড</span>
        </div>

        <div className="bg-amber-50/70 p-3 sm:p-3.5 rounded-2xl border border-amber-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase">পেন্ডিং অর্ডার</span>
          <div className="text-lg sm:text-xl font-black text-amber-900">{stats.pending}টি</div>
          <span className="text-[10px] text-amber-700 font-medium">কল করে কনফার্ম করুন</span>
        </div>

        <div className="bg-blue-50/70 p-3 sm:p-3.5 rounded-2xl border border-blue-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase">কনফার্মড</span>
          <div className="text-lg sm:text-xl font-black text-blue-900">{stats.confirmed}টি</div>
          <span className="text-[10px] text-blue-700 font-medium">প্যাকিং প্রস্তুত হচ্ছে</span>
        </div>

        <div className="bg-indigo-50/70 p-3 sm:p-3.5 rounded-2xl border border-indigo-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-800 uppercase">কুরিয়ারে আছে</span>
          <div className="text-lg sm:text-xl font-black text-indigo-900">{stats.shipped + stats.processing}টি</div>
          <span className="text-[10px] text-indigo-700 font-medium">ডেলিভারির পথে</span>
        </div>

        <div className="bg-emerald-50/70 p-3 sm:p-3.5 rounded-2xl border border-emerald-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase">ডেলিভারি সম্পন্ন</span>
          <div className="text-lg sm:text-xl font-black text-emerald-900">{stats.delivered}টি</div>
          <span className="text-[10px] text-emerald-700 font-medium">সফল ক্যাশ রিসিভড</span>
        </div>

        <div className="bg-rose-50/70 p-3 sm:p-3.5 rounded-2xl border border-rose-200 shadow-sm space-y-0.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#6B112B] uppercase">মোট বিক্রি</span>
          <div className="text-lg sm:text-xl font-black text-[#6B112B]">৳{stats.totalRevenue?.toLocaleString()}</div>
          <span className="text-[10px] text-rose-700 font-medium">ক্যাশ অন ডেলিভারি</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full md:w-80">
          <FloatingInput
            label="অর্ডার নং, নাম বা ফোন নম্বর খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedStatus === "all"
                ? "bg-[#6B112B] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            সব ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(String(ORDER_STATUS.PENDING))}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedStatus === String(ORDER_STATUS.PENDING)
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            পেন্ডিং ({stats.pending})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(String(ORDER_STATUS.CONFIRMED))}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedStatus === String(ORDER_STATUS.CONFIRMED)
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
            }`}
          >
            কনফার্মড ({stats.confirmed})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(String(ORDER_STATUS.SHIPPED))}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedStatus === String(ORDER_STATUS.SHIPPED)
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100"
            }`}
          >
            কুরিয়ারে ({stats.shipped})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus(String(ORDER_STATUS.DELIVERED))}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedStatus === String(ORDER_STATUS.DELIVERED)
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300"
            }`}
          >
            ডেলিভার্ড ({stats.delivered})
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <Skeleton className="h-6 w-28 rounded-lg bg-rose-100" />
                <Skeleton className="h-6 w-24 rounded-full bg-amber-100" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-2">
                  <Skeleton className="h-5 w-40 bg-slate-200" />
                  <Skeleton className="h-8 w-48 rounded-xl bg-emerald-100/70" />
                  <Skeleton className="h-4 w-full bg-slate-100" />
                </div>
                <div className="lg:col-span-7 space-y-2">
                  <Skeleton className="h-14 w-full rounded-xl bg-slate-100" />
                  <Skeleton className="h-12 w-full rounded-xl bg-rose-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="h-14 w-14 rounded-full bg-rose-50 text-[#6B112B] flex items-center justify-center mx-auto">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">কোনো কাস্টমার অর্ডার পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" এর জন্য কোনো অর্ডার মেলেনি। অন্য কিছু লিখে খুঁজুন।`
              : "গ্রাহকরা ওয়েবসাইটে অর্ডার প্লেস করলে সাথে সাথে এই ড্যাশবোর্ডে প্রদর্শিত হবে।"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP[ORDER_STATUS.PENDING];
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "আজকে";

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden p-5 space-y-4"
              >
                {/* Order Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.orderNumber, "অর্ডার নম্বর")}
                      className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#6B112B] bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                      title="কপি করুন"
                    >
                      <span>{order.orderNumber}</span>
                      <Copy className="h-3 w-3 text-slate-400" />
                    </button>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                      {statusConfig.labelBn}
                    </span>

                    {/* Quick Status Select */}
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleUpdateStatus(order._id, Number(e.target.value))}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6B112B]"
                    >
                      <option value={ORDER_STATUS.PENDING}>পেন্ডিং</option>
                      <option value={ORDER_STATUS.CONFIRMED}>কনফার্মড</option>
                      <option value={ORDER_STATUS.PROCESSING}>প্রসেসিং (প্যাকিং)</option>
                      <option value={ORDER_STATUS.SHIPPED}>কুরিয়ারে হস্তান্তর</option>
                      <option value={ORDER_STATUS.DELIVERED}>ডেলিভার্ড</option>
                      <option value={ORDER_STATUS.CANCELLED}>অর্ডার বাতিল</option>
                    </select>
                  </div>
                </div>

                {/* Customer Info & Order Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Customer Info (5 cols) */}
                  <div className="lg:col-span-5 space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[#6B112B]" /> {order.customerName}
                      </span>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        ক্যাশ অন ডেলিভারি
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${order.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#6B112B] text-slate-800 font-bold transition-colors shadow-sm"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{order.phone}</span>
                      </a>

                      <a
                        href={`https://wa.me/88${order.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `আসসালামু আলাইকুম ${order.customerName}, নারী নিবেদিত থেকে আপনার অর্ডার #${order.orderNumber} সম্পর্কে যোগাযোগ করা হয়েছে।`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <MessageCircle className="h-3.5 w-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex items-start gap-1.5 text-slate-600 pt-1">
                      <MapPin className="h-4 w-4 text-[#6B112B] shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{order.address}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        ডেলিভারি এরিয়া: <strong>{order.deliveryArea === "inside_dhaka" ? "ঢাকার ভেতরে (৳৬০)" : "ঢাকার বাইরে (৳১৩০)"}</strong>
                      </span>
                    </div>

                    {order.note && (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 text-[11px] italic">
                        <strong>নোট:</strong> {order.note}
                      </div>
                    )}
                  </div>

                  {/* Right: Ordered Items and Total Calculation (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        অর্ডারকৃত পণ্য তালিকা ({order.items?.length || 0}টি আইটেম)
                      </span>

                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 bg-white"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <Image
                                  src={item.image || "/images/products/churi-alna.jpg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate max-w-xs">
                                  {item.name}
                                </h5>
                                {item.size && (
                                  <span className="text-[11px] text-slate-500 block">{item.size}</span>
                                )}
                                <span className="text-[11px] text-slate-400">
                                  ৳{item.price?.toLocaleString()} × {item.quantity}টি
                                </span>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-slate-900 shrink-0">
                              ৳{(item.price * item.quantity)?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financials Summary Footer */}
                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                      <div className="space-x-3 text-slate-600">
                        <span>সাবটোটাল: <strong>৳{order.subtotal?.toLocaleString()}</strong></span>
                        <span>ডেলিভারি চার্জ: <strong>৳{order.deliveryFee || (order.deliveryArea === "inside_dhaka" ? 60 : 130)}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">সর্বমোট প্রদেয়</span>
                        <span className="text-base font-black text-[#6B112B]">
                          ৳{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
