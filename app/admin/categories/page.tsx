"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Layers, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  ArrowRight,
  Save,
  Tag,
  Package,
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingInput } from "@/components/ui/floating-input";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  
  // New Category Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    id: "",
    badge: "নতুন",
    image: "/images/products/churi-alna.jpg",
    order: "1",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        setFormData((prev) => ({
          ...prev,
          order: (json.data.length + 1).toString(),
        }));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("ক্যাটাগরি লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("ক্যাটাগরির নাম লিখুন");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim() || "Exclusive Collection",
          id: formData.id.trim() || undefined,
          badge: formData.badge.trim() || "নতুন",
          image: formData.image.trim() || "/images/products/churi-alna.jpg",
          order: parseInt(formData.order) || categories.length + 1,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories((prev) => [...prev, json.data]);
        toast.success("নতুন ক্যাটাগরি ডাটাবেসে সফলভাবে যুক্ত হয়েছে!");
        setFormData({
          title: "",
          subtitle: "",
          id: "",
          badge: "নতুন",
          image: "/images/products/churi-alna.jpg",
          order: (categories.length + 2).toString(),
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        toast.error(json.message || "ক্যাটাগরি যুক্ত করা সম্ভব হয়নি");
      }
    } catch (err) {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (cat: any) => {
    const currentActive = cat.status === 1 || cat.status === true;
    const newStatusNum = currentActive ? 0 : 1;

    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          _id: cat._id,
          status: newStatusNum,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.map((c) =>
            (c.id === cat.id || (c._id && c._id === cat._id))
              ? { ...c, status: newStatusNum === 1 }
              : c
          )
        );
        toast.success(newStatusNum === 1 ? "ক্যাটাগরি সক্রিয় করা হয়েছে" : "ক্যাটাগরি বন্ধ করা হয়েছে");
      } else {
        toast.error(json.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার ত্রুটি ঘটেছে");
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const targetParam = categoryToDelete._id
        ? `_id=${categoryToDelete._id}`
        : `id=${categoryToDelete.id}`;

      const res = await fetch(`/api/categories?${targetParam}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.filter(
            (c) =>
              (c._id && c._id !== categoryToDelete._id) &&
              c.id !== categoryToDelete.id
          )
        );
        toast.success(`"${categoryToDelete.title}" ক্যাটাগরি ডাটাবেস থেকে মুছে ফেলা হয়েছে!`);
      } else {
        toast.error(json.message || "মুছে ফেলা ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const titleMatch = (c.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const subMatch = (c.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || subMatch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
              ক্যাটাগরি ম্যানেজমেন্ট (Category Management)
            </h1>
            <Badge className="bg-[#6B112B] text-white text-[10px] font-bold">
              {categories.length} টি ক্যাটাগরি
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            হোমপেজ ও ফিল্টারে প্রদর্শনের জন্য পণ্যের বিভাগসমূহ যুক্ত ও সাজান
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products/add">
            <Button size="sm" className="bg-[#6B112B] hover:bg-[#50091D] text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন পণ্য যোগ</span>
            </Button>
          </Link>
          <Link href="/products" target="_blank">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 text-xs font-semibold rounded-xl gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> স্টোর দেখুন
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-in slide-in-from-top-2 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-emerald-950">
              নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!
            </h4>
            <p className="text-xs text-emerald-700">
              ফ্রন্টএন্ড তালিকায় সাথে সাথেই যুক্ত হয়েছে। ব্যাকএন্ড এপিআই কানেক্ট করার পর ডাটাবেসে সেভ হবে।
            </p>
          </div>
        </div>
      )}

      {/* Main Layout: Left Form (4 cols), Right Categories List (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Add New Category Form (4 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/90 shadow-sm rounded-2xl sticky top-24">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-[#6B112B]" />
                <span>নতুন ক্যাটাগরি তৈরি করুন</span>
              </CardTitle>
              <CardDescription className="text-xs">
                নাম, স্লাগ এবং কাভার ছবির লিঙ্ক দিয়ে ক্যাটাগরি যুক্ত করুন
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleAddCategory} className="space-y-3.5 sm:space-y-4">
                
                <FloatingInput
                  label="ক্যাটাগরির বাংলা নাম (যেমন: ঐতিহ্যবাহী ব্রাইডাল সেট)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <FloatingInput
                  label="সাব-টাইটেল / ইংরেজি নাম (e.g. Bridal Jewellery)"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FloatingInput
                    label="URL Slug (e.g. bridal-set)"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="font-mono lowercase"
                  />

                  <FloatingInput
                    label="হাইলাইট ব্যাজ (e.g. এক্সক্লুসিভ)"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>

                <FloatingInput
                  label="কাভার ছবির লিঙ্ক (Image URL)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="font-mono"
                />

                {/* Real-time Category Card Preview */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    কার্ড প্রিভিউ (Preview)
                  </span>
                  <div className="relative rounded-2xl overflow-hidden min-h-[140px] flex flex-col justify-end p-4 border border-rose-200 bg-slate-900 shadow-sm">
                    <div className="absolute inset-0">
                      <Image
                        src={formData.image || "/images/products/churi-alna.jpg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                    <div className="relative z-10 text-center flex flex-col items-center">
                      <span className="text-[9px] font-bold text-[#F5E6B3] bg-[#6B112B]/90 px-2 py-0.5 rounded-full mb-1">
                        {formData.badge || "ব্যাজ"}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {formData.title || "ক্যাটাগরির নাম"}
                      </h4>
                      <span className="text-[10px] text-rose-200/80">
                        {formData.subtitle || "সাব-টাইটেল"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl h-11 text-xs gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>ডাটাবেসে সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 text-[#F5E6B3]" />
                      <span>ক্যাটাগরি যুক্ত করুন</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Existing Categories Grid & Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <FloatingInput
                type="search"
                label="ক্যাটাগরি খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Categories Grid List */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`cat-admin-skel-${i}`}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <Skeleton className="h-14 w-14 rounded-xl bg-rose-100/60 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-40 bg-slate-200" />
                      <Skeleton className="h-3 w-32 bg-slate-100" />
                      <Skeleton className="h-3 w-20 bg-amber-100/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-6 w-14 rounded-full bg-emerald-100/70" />
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))
            ) : filteredCategories.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">কোনো ক্যাটাগরি পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400">নতুন নাম দিয়ে সার্চ করুন অথবা ফর্ম দিয়ে যোগ করুন</p>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id || cat._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <Image
                        src={cat.image || "/images/products/churi-alna.jpg"}
                        alt={cat.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-serif truncate">
                          {cat.title}
                        </h4>
                        {cat.badge && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#6B112B] border border-rose-200 shrink-0">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {cat.subtitle} • <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">/{cat.id}</span>
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-[#B8860B] font-bold mt-0.5">
                        {cat.count || 0}টি পণ্য লাইভ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleStatus(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        cat.status === 1 || cat.status === true
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {cat.status === 1 || cat.status === true ? "সক্রিয়" : "বন্ধ"}
                    </button>

                    <Link href={`/products?category=${cat.id}`} target="_blank">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-500 hover:text-[#6B112B]" title="স্টোরে প্রিভিউ দেখুন">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setCategoryToDelete(cat)}
                      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="ক্যাটাগরি মুছে ফেলতে চান?"
        description="এই ক্যাটাগরি মুছে ফেললে এটি ওয়েবসাইট ও ডাটাবেস থেকে স্থায়ীভাবে অপসারিত হবে।"
        itemName={categoryToDelete?.title}
        itemSku={`স্লাগ: /${categoryToDelete?.id}`}
        itemImage={categoryToDelete?.image}
      />

    </div>
  );
}
