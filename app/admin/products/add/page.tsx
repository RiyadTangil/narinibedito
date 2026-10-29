"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Upload, 
  Package, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Save, 
  Eye,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Lightbulb,
  Truck,
  Star,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BADGE_OPTIONS = [
  "সেরা বিক্রিত",
  "কাস্টমাইজড",
  "হট ডিল",
  "নতুন কালেকশন",
  "ট্রেন্ডিং",
  "এক্সক্লুসিভ",
];

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") || searchParams.get("edit");
  const isEditing = Boolean(editId);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Interactive Form State for Frontend
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categorySlug: "",
    price: "",
    originalPrice: "",
    badge: "নতুন কালেকশন",
    size: "",
    capacity: "",
    material: "",
    stock: "25",
    inStock: true,
    highlight: "",
    description: "",
    image: "/images/products/churi-alna.jpg",
    secondaryImages: [
      "/images/products/home-mandir.jpg"
    ] as string[]
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  // 1. Fetch Categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategoriesList(json.data);
          if (!isEditing) {
            setFormData((prev) => ({
              ...prev,
              categorySlug: prev.categorySlug || json.data[0].id,
            }));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, [isEditing]);

  // 2. Fetch Existing Product when in Edit mode
  useEffect(() => {
    if (!editId) return;

    let isMounted = true;
    setLoadingProduct(true);

    fetch(`/api/products/${editId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          const p = json.data;
          setFormData({
            name: p.name || "",
            sku: p.sku || "",
            categorySlug: p.categorySlug || "",
            price: p.price !== undefined ? p.price.toString() : "",
            originalPrice: p.originalPrice !== undefined ? p.originalPrice.toString() : "",
            badge: p.badge || "নতুন কালেকশন",
            size: p.size || "",
            capacity: p.capacity || "",
            material: p.material || "",
            stock: p.stock !== undefined ? p.stock.toString() : "25",
            inStock: p.inStock ?? (p.stock > 0),
            highlight: p.highlight || "",
            description: p.description || "",
            image: p.image || "/images/products/churi-alna.jpg",
            secondaryImages: Array.isArray(p.secondaryImages) && p.secondaryImages.length > 0 
              ? p.secondaryImages 
              : ["/images/products/home-mandir.jpg"],
          });
        } else {
          toast.error("পণ্যের তথ্য লোড করা যায়নি");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product for editing:", err);
        if (isMounted) toast.error("পণ্যের তথ্য লোড করতে সমস্যা হয়েছে");
      })
      .finally(() => {
        if (isMounted) setLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editId]);

  const regularNum = parseFloat(formData.originalPrice) || 0;
  const saleNum = parseFloat(formData.price) || 0;
  const discountPercent = regularNum > saleNum && regularNum > 0 
    ? Math.round(((regularNum - saleNum) / regularNum) * 100)
    : 0;

  const currentCategory = categoriesList.find(c => c.id === formData.categorySlug)?.title || "ক্যাটাগরি";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("পণ্যের নাম আবশ্যক");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("পণ্যের সঠিক মূল্য প্রদান করুন");
      return;
    }
    if (!formData.image.trim()) {
      toast.error("পণ্যের ছবির লিংক প্রদান করুন");
      return;
    }

    try {
      setSubmitting(true);
      const url = "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const payload: Record<string, any> = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        categorySlug: formData.categorySlug,
        category: currentCategory,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: discountPercent > 0 ? `${discountPercent}% ছাড়` : "",
        badge: formData.badge,
        highlight: formData.highlight,
        description: formData.description,
        size: formData.size,
        material: formData.material,
        stock: parseInt(formData.stock, 10) || 10,
        inStock: formData.inStock,
        image: formData.image.trim(),
        secondaryImages: formData.secondaryImages,
        status: 1,
      };

      if (isEditing) {
        payload._id = editId;
        payload.id = editId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        toast.success(isEditing ? "পণ্য সফলভাবে আপডেট করা হয়েছে!" : "নতুন পণ্য সফলভাবে ডাটাবেসে যোগ হয়েছে!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      } else {
        toast.error(json.message || "পণ্য সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error("সার্ভার সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        secondaryImages: [...formData.secondaryImages, newImageUrl.trim()]
      });
      setNewImageUrl("");
    }
  };

  const removeSecondaryImage = (index: number) => {
    setFormData({
      ...formData,
      secondaryImages: formData.secondaryImages.filter((_, idx) => idx !== index)
    });
  };

  if (loadingProduct) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
        <Loader2 className="h-10 w-10 text-[#6B112B] animate-spin" />
        <p className="text-sm font-semibold text-slate-700">পণ্যের তথ্য লোড করা হচ্ছে...</p>
        <span className="text-xs text-slate-400">অনুগ্রহ করে একটু অপেক্ষা করুন</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-[#6B112B]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                {isEditing ? "পণ্য সম্পাদনা করুন (Edit Product)" : "নতুন পণ্য যুক্ত করুন"}
              </h1>
              <Badge className="bg-[#6B112B] text-white text-[10px] font-bold">
                {isEditing ? "EDIT MODE" : "PRO FORM"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {isEditing 
                ? "পণ্যের তথ্য, ছবি ও মূল্য পরিবর্তন করে ডাটাবেসে আপডেট করুন"
                : "নারী নিবেদিত স্টোরফ্রন্টে প্রদর্শনের জন্য পণ্যের বিস্তারিত ও ছবি আপলোড করুন"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-xs font-semibold">
              বাতিল করুন
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm shadow-rose-950/20 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#F5E6B3]" />
            ) : (
              <Save className="h-4 w-4 text-[#F5E6B3]" />
            )}
            <span>
              {submitting 
                ? "সংরক্ষণ হচ্ছে..." 
                : isEditing 
                ? "পরিবর্তন সংরক্ষণ করুন" 
                : "পণ্যটি পাবলিশ করুন"}
            </span>
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-sm animate-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                {isEditing ? "পণ্য সফলভাবে আপডেট হয়েছে!" : "পণ্য সফলভাবে তালিকাভুক্ত হয়েছে!"}
              </h4>
              <p className="text-xs text-emerald-700">
                ডাটাবেসে তথ্য সংরক্ষিত হয়েছে এবং স্টোরে লাইভ প্রদর্শিত হচ্ছে।
              </p>
            </div>
          </div>
          <Link href="/admin/products">
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-xl">
              পণ্য তালিকায় যান
            </Button>
          </Link>
        </div>
      )}

      {/* Main Form Layout: 2 Columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Basic Product Info */}
          <Card className="border-slate-200/90 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Package className="h-4 w-4 text-[#6B112B]" />
                <span>মৌলিক তথ্য (Basic Information)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                পণ্যের বাংলা নাম, ক্যাটাগরি এবং স্টোর ট্যাগ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                  পণ্যের পূর্ণ নাম / টাইটেল <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা"
                  className="rounded-xl border-slate-200 text-xs sm:text-sm h-10 focus:border-[#6B112B]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-slate-700">
                    ক্যাটাগরি নির্বাচন করুন <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 focus:border-[#6B112B] focus:outline-none"
                  >
                    {categoriesList.length === 0 ? (
                      <option value="">ক্যাটাগরি লোড হচ্ছে...</option>
                    ) : (
                      categoriesList.map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sku" className="text-xs font-bold text-slate-700">
                    SKU / প্রোডাক্ট কোড
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. NN-ALNA-01"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Promotional Badge & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    প্রোমোশনাল ব্যাজ
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {BADGE_OPTIONS.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormData({ ...formData, badge: b })}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border ${
                          formData.badge === b
                            ? "bg-[#6B112B] text-white border-[#6B112B] shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    স্টক এভেইলেবিলিটি
                  </Label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, inStock: true })}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                        formData.inStock 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      ইন স্টক
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, inStock: false })}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                        !formData.inStock 
                          ? "bg-red-50 text-red-800 border-red-300 shadow-xs" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      স্টক শেষ
                    </button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 2. Pricing & Inventory */}
          <Card className="border-slate-200/90 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#6B112B]" />
                <span>মূল্য ও স্টক পরিমাণ (Price & Inventory)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-bold text-slate-700">
                    বিক্রয় মূল্য (৳) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2250"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10 font-bold text-[#6B112B]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="originalPrice" className="text-xs font-bold text-slate-700">
                    পূর্বের রেগুলার মূল্য (৳)
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="2650"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stock" className="text-xs font-bold text-slate-700">
                    মজুদ স্টক সংখ্যা
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="35"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* 3. Specifications & Highlights */}
          <Card className="border-slate-200/90 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#6B112B]" />
                <span>স্পেসিফিকেশন ও বিবরণ (Specifications)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="size" className="text-xs font-bold text-slate-700">
                    সাইজ / পরিমাপ
                  </Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder={'যেমন: ২১" x ১৬" সাইজ'}
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-xs font-bold text-slate-700">
                    ধারণক্ষমতা
                  </Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="যেমন: ১৪০ ডজন চুড়ি"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="material" className="text-xs font-bold text-slate-700">
                    মেটেরিয়াল ও কাঠ
                  </Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="মেহগনি কাঠ ও স্বচ্ছ গ্লাস"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="highlight" className="text-xs font-bold text-slate-700">
                  মূল বৈশিষ্ট্য ও হাইলাইটস (বুলেট পয়েন্ট)
                </Label>
                <Input
                  id="highlight"
                  value={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                  placeholder="যেমন: স্বচ্ছ গ্লাস ডোর • সিকিউরিটি লক ও চাবি • ১৪০ ডজন ধারণক্ষমতা"
                  className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-slate-700">
                  পণ্যের বিস্তারিত বিবরণ (Full Description)
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="আপনার প্রিয় চুড়ি ও গহনাগুলো সাজিয়ে রাখার বিস্তারিত বিবরণ..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm focus:border-[#6B112B] focus:outline-none leading-relaxed"
                />
              </div>

            </CardContent>
          </Card>

          {/* 4. Product Images */}
          <Card className="border-slate-200/90 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#6B112B]" />
                <span>পণ্যের ছবি ও গ্যালারি (Product Images)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-xs font-bold text-slate-700">
                  প্রধান ছবির লিংক (Primary Image URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/products/churi-alna.jpg অথবা HTTPS লিংক"
                  className="rounded-xl border-slate-200 text-xs sm:text-sm h-10 font-mono"
                  required
                />
              </div>

              {/* Secondary Images Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700">
                  অতিরিক্ত ছবিসমূহ (Secondary Gallery)
                </Label>
                
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="অতিরিক্ত ছবির URL দিন..."
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-9 font-mono"
                  />
                  <Button
                    type="button"
                    onClick={addImageUrl}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold text-[#6B112B] shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> যোগ করুন
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {/* Primary Thumb */}
                  <div className="relative h-20 rounded-xl overflow-hidden border-2 border-[#6B112B] bg-slate-100 group">
                    <Image
                      src={formData.image || "/images/products/churi-alna.jpg"}
                      alt="Primary"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-[#6B112B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      মেইন
                    </span>
                  </div>

                  {/* Secondary Thumbs */}
                  {formData.secondaryImages.map((img, idx) => (
                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                      <Image
                        src={img}
                        alt={`Gallery ${idx}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSecondaryImage(idx)}
                        className="absolute top-1 right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Column: Live Storefront Card Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="sticky top-24 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-[#6B112B]" />
                <span>লাইভ প্রিভিউ (Storefront Preview)</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ওয়েবসাইটে যেমন দেখাবে
              </span>
            </div>

            {/* The Live Rendered Product Card */}
            <div className="group rounded-3xl border border-rose-200 bg-white overflow-hidden shadow-xl flex flex-col justify-between max-w-sm mx-auto">
              {/* Product Visual Container */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <Image
                  src={formData.image || "/images/products/churi-alna.jpg"}
                  alt={formData.name || "Product Preview"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Badge */}
                {formData.badge && (
                  <Badge className="absolute top-3.5 left-3.5 bg-[#6B112B] text-white font-medium text-xs shadow-md border-0">
                    {formData.badge}
                  </Badge>
                )}

                {/* Discount Tag */}
                {discountPercent > 0 && (
                  <span className="absolute top-3.5 right-3.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {discountPercent}% ছাড়
                  </span>
                )}

                {/* Size / Dimensions Tag */}
                {formData.size && (
                  <div className="absolute bottom-3.5 left-3.5 bg-black/75 text-[#F5E6B3] text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm font-medium border border-white/10">
                    {formData.size}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B112B] font-bold tracking-wide">
                      {currentCategory}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>৫.০</span>
                      <span className="text-slate-400 font-normal">
                        {isEditing ? "(আপডেটেড)" : "(নতুন)"}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">
                    {formData.name || "পণ্যের নাম"}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {formData.highlight || "হাইলাইটস"}
                  </p>
                </div>

                {/* Price and Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-[#6B112B]">
                        ৳{parseFloat(formData.price || "0").toLocaleString()}
                      </span>
                      {parseFloat(formData.originalPrice || "0") > 0 && (
                        <span className="ml-2 text-xs text-slate-400 line-through">
                          ৳{parseFloat(formData.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      formData.inStock 
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                        : "text-red-600 bg-red-50 border-red-100"
                    }`}>
                      {formData.inStock ? "ইন স্টক" : "স্টক শেষ"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 rounded-xl h-10 shadow-sm pointer-events-none">
                      <MessageCircle className="h-4 w-4 fill-white" />
                      <span>অর্ডার করুন</span>
                    </Button>

                    <Button size="sm" variant="outline" className="w-full border-rose-200 text-[#6B112B] font-semibold text-xs rounded-xl h-10 pointer-events-none">
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> বিস্তারিত
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Integration Preview */}
            <Card className="border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                <span>অটোমেটিক WhatsApp অর্ডার টেক্সট</span>
              </div>
              <p className="text-xs text-emerald-950 font-mono bg-white p-2.5 rounded-xl border border-emerald-200">
                "আমি '{formData.name || "পণ্য"} ({formData.price || "0"} টাকা)' অর্ডার করতে চাই।"
              </p>
              <span className="text-[10px] text-emerald-700 block">
                গ্রাহক স্টোরে 'অর্ডার করুন' বাটনে চাপ দিলেই এই মেসেজটি স্বয়ংক্রিয়ভাবে ওপেন হবে।
              </span>
            </Card>

            {/* Bottom Actions */}
            <div className="pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-2xl h-12 text-sm gap-2 shadow-lg shadow-rose-950/20 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#F5E6B3]" />
                ) : (
                  <Save className="h-4 w-4 text-[#F5E6B3]" />
                )}
                <span>
                  {submitting 
                    ? "সংরক্ষণ হচ্ছে..." 
                    : isEditing 
                    ? "পরিবর্তন সংরক্ষণ করুন" 
                    : "পণ্যটি পাবলিশ করুন"}
                </span>
              </Button>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
}

export default function AdminAddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
          <Loader2 className="h-10 w-10 text-[#6B112B] animate-spin" />
          <p className="text-sm font-semibold text-slate-700">লোড হচ্ছে...</p>
        </div>
      }
    >
      <ProductFormContent />
    </Suspense>
  );
}
