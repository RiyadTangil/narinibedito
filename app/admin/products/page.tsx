"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Real Nari Nibedito Products Catalog
const INITIAL_INVENTORY = [
  {
    id: "1",
    sku: "NN-ALNA-01",
    name: "এক্সক্লুসিভ ডাবল ডোর কাঠের চুড়ি আলনা (১৪০ ডজন ধারণক্ষমতা)",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 2250,
    originalPrice: 2650,
    stock: 24,
    status: "Active",
    badge: "সেরা বিক্রিত",
    size: "২১\" x ১৬\" সাইজ",
    image: "/images/products/churi-alna.jpg",
  },
  {
    id: "2",
    sku: "NN-MANDIR-02",
    name: "কাস্টমাইজড উডেন হোম মন্দির (ওম ও গণেশ এলইডি ব্যাকলিট)",
    category: "হোম মন্দির ও ডেকোর",
    categorySlug: "home-decor",
    price: 3450,
    originalPrice: 4200,
    stock: 12,
    status: "Active",
    badge: "কাস্টমাইজড",
    size: "২৪\" x ১৮\" ওয়াল মাউন্ট",
    image: "/images/products/home-mandir.jpg",
  },
  {
    id: "3",
    sku: "NN-CHURI-03",
    name: "উৎসবের রেশমি কাচের চুড়ি স্পেশাল কম্বো সেট (৬০ পিস)",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 580,
    originalPrice: 720,
    stock: 85,
    status: "Active",
    badge: "নতুন কালেকশন",
    size: "সাইজ ২.৪, ২.৬, ২.৮",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    sku: "NN-BOX-04",
    name: "এম্বিয়েন্ট এলইডি লাইটিংসহ ড্রয়ারযুক্ত রয়্যাল চুড়ি বক্স",
    category: "চুড়ি আলনা ও শোকেস",
    categorySlug: "churi-alna",
    price: 1950,
    originalPrice: 2350,
    stock: 5,
    status: "Low Stock",
    badge: "ট্রেন্ডিং",
    size: "১৮\" x ১৪\" সাইজ",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    sku: "NN-ORG-05",
    name: "রয়্যাল মাল্টি-লেয়ার জুয়েলারি ও মেকআপ অর্গানাইজার কেবিনেট",
    category: "জুয়েলারি বক্স ও কেবিনেট",
    categorySlug: "organizer",
    price: 1650,
    originalPrice: 1950,
    stock: 16,
    status: "Active",
    badge: "জনপ্রিয়",
    size: "১৬\" x ১২\" সাইজ",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    sku: "NN-LIGHT-06",
    name: "হ্যান্ডক্রাফটেড ফেয়ারি লাইট গ্লাস বোটল ডেকোর শোপিস",
    category: "শোপিস ও ফেয়ারি লাইটিং",
    categorySlug: "lighting",
    price: 450,
    originalPrice: 550,
    stock: 30,
    status: "Active",
    badge: "গিফট চয়েস",
    size: "স্ট্যান্ডার্ড বোটল",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "7",
    sku: "NN-BALA-07",
    name: "ঐতিহ্যবাহী গোল্ড-প্লেটেড ব্রাইডাল বালা ও চুড়ি সেট",
    category: "ঐতিহ্যবাহী চুড়ি ও গহনা",
    categorySlug: "jewellery",
    price: 1150,
    originalPrice: 1450,
    stock: 0,
    status: "Out of Stock",
    badge: "ব্রাইডাল স্পেশাল",
    size: "কম্বো সাইজ",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "8",
    sku: "NN-KURTI-08",
    name: "ডিজাইনার এমব্রয়ডারি উৎসব কুর্তি ও থ্রি-পিস সেট",
    category: "পোশাক ও উৎসবের কুর্তি",
    categorySlug: "clothing",
    price: 1850,
    originalPrice: 2200,
    stock: 19,
    status: "Active",
    badge: "এক্সক্লুসিভ",
    size: "M, L, XL, XXL",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
              সকল পণ্য ক্যাটালগ (Products Catalog)
            </h1>
            <Badge className="bg-[#6B112B] text-white text-[10px] font-bold">
              {filteredProducts.length} টি পণ্য
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            স্টোরের স্টক, মূল্য এবং লাইভ প্রোডাক্ট সহজে নিয়ন্ত্রণ ও এডিট করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/categories">
            <Button size="sm" variant="outline" className="border-rose-200 text-[#6B112B] hover:bg-rose-50 text-xs font-bold rounded-xl gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>ক্যাটাগরি</span>
            </Button>
          </Link>

          <Link href="/admin/products/add">
            <Button size="sm" className="bg-[#6B112B] hover:bg-[#50091D] text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm shadow-rose-950/20">
              <PlusCircle className="h-3.5 w-3.5 text-[#F5E6B3]" />
              <span>নতুন পণ্য যোগ করুন</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/90 shadow-sm rounded-2xl p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের নাম বা SKU কোড দিয়ে সার্চ করুন..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#6B112B]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-[#6B112B] focus:outline-none"
            >
              <option value="all">সব ক্যাটাগরি</option>
              <option value="churi-alna">চুড়ি আলনা ও শোকেস</option>
              <option value="home-decor">হোম মন্দির ও ডেকোর</option>
              <option value="jewellery">ঐতিহ্যবাহী চুড়ি ও গহনা</option>
              <option value="organizer">জুয়েলারি বক্স ও কেবিনেট</option>
              <option value="lighting">শোপিস ও লাইটিং</option>
              <option value="clothing">পোশাক ও কুর্তি</option>
            </select>
          </div>

        </div>
      </Card>

      {/* Products Table */}
      <Card className="border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-4">পণ্য ও ছবি</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">সাইজ ও স্পেক্স</th>
                <th className="py-3.5 px-4">বিক্রয় মূল্য</th>
                <th className="py-3.5 px-4">স্টক স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Product Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col max-w-sm">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 leading-snug">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            SKU: {p.sku}
                          </span>
                          {p.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0 rounded bg-rose-50 text-[#6B112B] border border-rose-200">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-semibold">
                      {p.category}
                    </Badge>
                  </td>

                  {/* Size */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                    {p.size}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-black text-[#6B112B] text-sm">
                        ৳{p.price.toLocaleString()}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ৳{p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : p.status === "Low Stock"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {p.stock > 0 ? `${p.stock} পিস এভেইলেবল` : "স্টক শেষ"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${p.id}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-[#6B112B]" title="ওয়েবসাইটে প্রিভিউ দেখুন">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href="/admin/products/add">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600" title="এডিট করুন">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteProduct(p.id)}
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

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <Package className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">কোনো পণ্য পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করুন বা নতুন পণ্য যোগ করুন</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>মোট {filteredProducts.length}টি পণ্য প্রদর্শিত হচ্ছে</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled className="rounded-xl h-8 text-xs">পূর্ববর্তী</Button>
            <Button size="sm" variant="outline" disabled className="rounded-xl h-8 text-xs">পরবর্তী</Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
