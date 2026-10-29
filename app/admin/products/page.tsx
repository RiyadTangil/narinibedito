"use client";

import { useState, useEffect } from "react";
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
  ExternalLink,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("পণ্য তালিকা লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategoriesList(json.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
        setProducts((prev) =>
          prev.filter(
            (p) =>
              (p._id && p._id !== productToDelete._id) &&
              (p.sku && p.sku !== productToDelete.sku) &&
              p.id !== productToDelete.id
          )
        );
        toast.success(`"${productToDelete.name}" ডাটাবেস থেকে সফলভাবে ডিলিট করা হয়েছে!`);
      } else {
        toast.error(json.message || "ডিলিট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভার সমস্যা হয়েছে");
    } finally {
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      p.categorySlug === selectedCategory ||
      p.category === selectedCategory;
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
              {categoriesList.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
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

                      <Link href={`/admin/products/add?id=${p._id || p.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600" title="এডিট করুন">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setProductToDelete(p)}
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

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B112B] mx-auto" />
            <p className="text-xs text-slate-500">ডাটাবেস থেকে পণ্য তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">কোনো পণ্য পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করুন বা নতুন পণ্য যোগ করুন</p>
          </div>
        ) : null}

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>মোট {filteredProducts.length}টি পণ্য প্রদর্শিত হচ্ছে</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled className="rounded-xl h-8 text-xs">পূর্ববর্তী</Button>
            <Button size="sm" variant="outline" disabled className="rounded-xl h-8 text-xs">পরবর্তী</Button>
          </div>
        </div>
      </Card>

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
