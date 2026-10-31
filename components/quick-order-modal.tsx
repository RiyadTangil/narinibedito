"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ShoppingBag, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Minus, 
  Plus, 
  MessageCircle,
  Package,
  RotateCcw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface QuickOrderProduct {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  sku?: string;
  category?: string;
}

interface QuickOrderModalProps {
  product: QuickOrderProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: any) => void;
  initialQuantity?: number;
}

export function QuickOrderModal({
  product,
  isOpen,
  onClose,
  onSuccess,
  initialQuantity = 1,
}: QuickOrderModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"inside_dhaka" | "outside_dhaka">("outside_dhaka");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Sync initial quantity when modal opens or initialQuantity changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity > 0 ? initialQuantity : 1);
    }
  }, [isOpen, initialQuantity]);

  if (!product) return null;

  const deliveryFee = deliveryArea === "inside_dhaka" ? 60 : 130;
  const subtotal = product.price * quantity;
  const totalAmount = subtotal + deliveryFee;

  const handleReset = () => {
    setQuantity(1);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setDeliveryArea("outside_dhaka");
    setNote("");
    setCreatedOrder(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন");
      return;
    }

    if (!address.trim()) {
      toast.error("আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা নং, রোড, থানা ও জেলা)");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          deliveryArea,
          deliveryFee,
          note: note.trim(),
          items: [
            {
              productId: product.id || "",
              name: product.name,
              price: product.price,
              quantity,
              size: product.size || "",
              image: product.image,
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCreatedOrder(json.data);
        toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!", {
          description: `অর্ডার নম্বর: ${json.data.orderNumber}`,
        });
        if (onSuccess) onSuccess(json.data);
      } else {
        toast.error(json.message || "অর্ডার সম্পন্ন হতে সমস্যা হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] sm:w-[92vw] md:max-w-3xl lg:max-w-4xl bg-white rounded-3xl p-4 sm:p-6 lg:p-7 max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-2xl border border-slate-200">
        {!createdOrder ? (
          <div className="space-y-5">
            {/* Modal Header */}
            <DialogHeader className="space-y-1.5 text-left border-b border-slate-200 pb-3.5 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> সহজ ও দ্রুত অর্ডার
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> ক্যাশ অন ডেলিভারি (পণ্য দেখে টাকা দিন)
                </Badge>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif pt-1">
                পণ্যটি সরাসরি অর্ডার করুন
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500">
                নিচের তথ্যগুলো পূরণ করুন। কোনো অগ্রিম টাকা ছাড়াই ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন।
              </DialogDescription>
            </DialogHeader>

            {/* 2-Column Responsive Layout: Left Product Details, Right Checkout Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
              
              {/* ========================================================= */}
              {/* Left Column: Product Showcase & Billing Summary (5 Cols)  */}
              {/* ========================================================= */}
              <div className="md:col-span-5 space-y-4">
                {/* Product Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3.5">
                  <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
                    <Image
                      src={product.image || "/images/products/churi-alna.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 380px"
                      priority
                    />
                    {product.category && (
                      <Badge className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-medium border-0 shadow">
                        {product.category}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-left">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-serif">
                      {product.name}
                    </h4>
                    {product.size && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
                        <Package className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{product.size}</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-slate-900">
                        ৳{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ৳{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ইন স্টক
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      পরিমাণ (Quantity):
                    </span>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-black text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>পণ্যের মূল্য ({quantity}টি)</span>
                    <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>কুরিয়ার ডেলিভারি চার্জ</span>
                    <span className="font-bold text-slate-800">৳{deliveryFee}</span>
                  </div>
                  <div className="border-t border-indigo-100 pt-2 flex justify-between items-center text-sm font-black text-indigo-700">
                    <span>সর্বমোট প্রদেয় মূল্য</span>
                    <span className="text-lg">৳{totalAmount.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block text-right">
                    * ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)
                  </span>
                </div>

                {/* Delivery Guarantee Highlights */}
                <div className="hidden sm:block space-y-1.5 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করার সুবিধা</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Truck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>সুরক্ষিত কাঠের প্যাকেজিংয়ে সারাদেশে দ্রুত কুরিয়ার</span>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* Right Column: Customer Details Checkout Form (7 Cols)     */}
              {/* ========================================================= */}
              <div className="md:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-left">
                  {/* Customer Name */}
                  <FloatingInput
                    label="আপনার পুরো নাম (উদাঃ জান্নাতুল ফেরদৌস)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    icon={<User className="h-4 w-4 text-indigo-600" />}
                    required
                  />

                  {/* Customer Phone */}
                  <FloatingInput
                    type="tel"
                    label="মোবাইল নম্বর (১১ ডিজিট - 017XXXXXXXX)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<Phone className="h-4 w-4 text-indigo-600" />}
                    className="font-mono"
                    required
                  />

                  {/* Delivery Area Selector Cards */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-indigo-600" /> ডেলিভারি এরিয়া বেছে নিন *
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryArea("inside_dhaka")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryArea === "inside_dhaka"
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 font-bold shadow-xs ring-1 ring-indigo-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold">ঢাকার ভেতরে</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          কুরিয়ার চার্জ: ৳৬০
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryArea("outside_dhaka")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deliveryArea === "outside_dhaka"
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 font-bold shadow-xs ring-1 ring-indigo-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold">ঢাকার বাইরে (সারাদেশ)</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          কুরিয়ার চার্জ: ৳১৩০
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Full Delivery Address */}
                  <FloatingTextarea
                    label="সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা নং, রোড, থানা ও জেলা)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    required
                  />

                  {/* Optional Note */}
                  <FloatingInput
                    label="বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />

                  {/* Submit Order Button */}
                  <div className="pt-2 space-y-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-12 rounded-2xl shadow-lg shadow-indigo-950/20 text-sm sm:text-base gap-2 transition-all active:scale-[0.99]"
                    >
                      {submitting ? (
                        <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 text-amber-300" />
                          <span>অর্ডার কনফার্ম করুন (৳{totalAmount.toLocaleString()})</span>
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই, পণ্য পেয়ে টাকা দিন</span>
                    </p>
                  </div>
                </form>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* Order Placement Success View                              */
          /* ========================================================= */
          <div className="text-center py-6 sm:py-8 space-y-6 max-w-lg mx-auto">
            <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
              <CheckCircle2 className="h-11 w-11" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-xs px-3.5 py-1">
                অর্ডার নম্বর: {createdOrder.orderNumber}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                অভিনন্দন! আপনার অর্ডার সফল হয়েছে
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-4">
                ধন্যবাদ <strong>{createdOrder.customerName}</strong>! আমাদের কাস্টমার সাপোর্ট টিম অর্ডারটি কনফার্ম করতে এবং ডেলিভারি প্রস্তুত করতে শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবেন।
              </p>
            </div>

            {/* Order Confirmation Receipt Card */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-slate-500">অর্ডারকৃত পণ্য:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{product.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-bold text-slate-900">{createdOrder.items?.[0]?.quantity || quantity}টি</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-slate-500">ডেলিভারি এরিয়া:</span>
                <span className="font-medium text-slate-800">
                  {createdOrder.deliveryArea === "inside_dhaka" ? "ঢাকার ভেতরে (৳৬০)" : "ঢাকার বাইরে (৳১৩০)"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">{createdOrder.address}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-700">সর্বমোট প্রদেয় (ক্যাশ অন ডেলিভারি):</span>
                <span className="font-black text-indigo-700 text-base sm:text-lg">
                  ৳{createdOrder.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <a
                href={`https://wa.me/8801614258804?text=${encodeURIComponent(
                  `Hello Nari Nibedito, I just placed order #${createdOrder.orderNumber} for "${product.name}". Total: ৳${createdOrder.totalAmount}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#1fb355] text-white font-bold h-11 rounded-xl shadow-md gap-2 text-xs sm:text-sm">
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>WhatsApp-এ অর্ডার মেসেজ পাঠান</span>
                </Button>
              </a>

              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-10 rounded-xl text-xs font-semibold"
              >
                ঠিক আছে, বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
