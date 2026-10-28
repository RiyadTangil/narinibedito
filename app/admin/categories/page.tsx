"use client";

import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Initial categories matching the Facebook banner
const INITIAL_CATEGORIES = [
  {
    id: "churi-alna",
    title: "চুড়ি আলনা ও শোকেস",
    subtitle: "Bangle Alna & Showcase",
    count: 14,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    badge: "সেরা বিক্রিত",
    order: 1,
    status: true,
  },
  {
    id: "home-decor",
    title: "হোম মন্দির ও ডেকোর",
    subtitle: "Custom Mandir & Decor",
    count: 8,
    image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80",
    badge: "কাস্টমাইজড",
    order: 2,
    status: true,
  },
  {
    id: "jewellery",
    title: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    subtitle: "Reshmi & Bridal Bangles",
    count: 12,
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
    badge: "হট কালেকশন",
    order: 3,
    status: true,
  },
  {
    id: "organizer",
    title: "জুয়েলারি বক্স ও কেবিনেট",
    subtitle: "Multi-layer Organizer",
    count: 6,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    badge: "রয়্যাল ফিনিশ",
    order: 4,
    status: true,
  },
  {
    id: "lighting",
    title: "শোপিস ও ফেয়ারি লাইটিং",
    subtitle: "Showpieces & Fairy Lights",
    count: 8,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
    badge: "গিফট চয়েস",
    order: 5,
    status: true,
  },
  {
    id: "clothing",
    title: "পোশাক ও উৎসবের কুর্তি",
    subtitle: "Women's Festive Outfits",
    count: 10,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    badge: "নিউ অ্যারাইভাল",
    order: 6,
    status: true,
  },
  {
    id: "accessories",
    title: "ব্যাগ ও লেডিস এক্সেসরিজ",
    subtitle: "Luxury Bags & Clutches",
    count: 7,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    badge: "ট্রেন্ডি",
    order: 7,
    status: true,
  },
  {
    id: "beauty",
    title: "বিউটি, স্কিনকেয়ার ও গিফট",
    subtitle: "Cosmetics & Fragrance",
    count: 9,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    badge: "জনপ্রিয়",
    order: 8,
    status: true,
  },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // New Category Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    id: "",
    badge: "নতুন",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    order: (categories.length + 1).toString(),
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newSlug = formData.id.trim() || formData.title.toLowerCase().replace(/\s+/g, "-");
    
    const newCat = {
      id: newSlug,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || "Exclusive Collection",
      count: 0,
      image: formData.image.trim() || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
      badge: formData.badge.trim() || "নতুন",
      order: parseInt(formData.order) || categories.length + 1,
      status: true,
    };

    setCategories([...categories, newCat]);
    setFormData({
      title: "",
      subtitle: "",
      id: "",
      badge: "নতুন",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
      order: (categories.length + 2).toString(),
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const toggleStatus = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, status: !c.status } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const filteredCategories = categories.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <form onSubmit={handleAddCategory} className="space-y-4">
                
                <div className="space-y-1.5">
                  <Label htmlFor="catTitle" className="text-xs font-bold text-slate-700">
                    ক্যাটাগরির বাংলা নাম <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="catTitle"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: ঐতিহ্যবাহী ব্রাইডাল সেট"
                    className="rounded-xl border-slate-200 text-xs sm:text-sm h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="catSubtitle" className="text-xs font-bold text-slate-700">
                    সাব-টাইটেল / ইংরেজি নাম
                  </Label>
                  <Input
                    id="catSubtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Bridal Jewellery Collection"
                    className="rounded-xl border-slate-200 text-xs h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="catSlug" className="text-xs font-bold text-slate-700">
                      URL Slug
                    </Label>
                    <Input
                      id="catSlug"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="e.g. bridal-set"
                      className="rounded-xl border-slate-200 text-xs h-10 font-mono lowercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="catBadge" className="text-xs font-bold text-slate-700">
                      হাইলাইট ব্যাজ
                    </Label>
                    <Input
                      id="catBadge"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g. এক্সক্লুসিভ"
                      className="rounded-xl border-slate-200 text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="catImage" className="text-xs font-bold text-slate-700">
                    কাভার ছবির লিঙ্ক (Image URL)
                  </Label>
                  <Input
                    id="catImage"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="rounded-xl border-slate-200 text-xs h-10 font-mono"
                  />
                </div>

                {/* Real-time Category Card Preview */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    কার্ড প্রিভিউ (Preview)
                  </span>
                  <div className="relative rounded-2xl overflow-hidden min-h-[140px] flex flex-col justify-end p-4 border border-rose-200 bg-slate-900 shadow-sm">
                    <div className="absolute inset-0">
                      <Image
                        src={formData.image || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80"}
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
                  className="w-full bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl h-11 text-xs gap-2 shadow-sm"
                >
                  <Save className="h-4 w-4 text-[#F5E6B3]" />
                  <span>ক্যাটাগরি যুক্ত করুন</span>
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
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ক্যাটাগরি খুঁজুন..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#6B112B]"
              />
            </div>
          </div>

          {/* Categories Grid List */}
          <div className="space-y-3">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 font-serif truncate">
                        {cat.title}
                      </h4>
                      {cat.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#6B112B] border border-rose-200 shrink-0">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 truncate">
                      {cat.subtitle} • <span className="font-mono text-[11px] text-slate-400">/{cat.id}</span>
                    </span>
                    <span className="text-[11px] text-[#B8860B] font-bold mt-0.5">
                      {cat.count}টি পণ্য লাইভ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStatus(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      cat.status 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {cat.status ? "সক্রিয়" : "বন্ধ"}
                  </button>

                  <Link href={`/products?category=${cat.id}`} target="_blank">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-[#6B112B]" title="স্টোরে প্রিভিউ দেখুন">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCategory(cat.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">কোনো ক্যাটাগরি পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-400">নতুন নাম দিয়ে সার্চ করুন অথবা বাম পাশের ফর্ম দিয়ে যোগ করুন</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
