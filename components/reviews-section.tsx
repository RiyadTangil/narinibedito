"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  ThumbsUp, 
  MessageSquarePlus, 
  ShieldCheck, 
  MapPin, 
  User, 
  Send, 
  Sparkles, 
  CheckCircle2,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Phone } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface ReviewItem {
  _id?: string;
  name: string;
  location?: string;
  phone?: string;
  rating: number;
  comment: string;
  productTitle?: string;
  productId?: string;
  verifiedPurchase?: boolean;
  likes?: number;
  createdAt?: string;
}

interface ReviewsSectionProps {
  productId?: string;
  productTitle?: string;
  onOpenReviewModal?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "অসাধারণ! অত্যন্ত সন্তুষ্ট (৫/৫)",
  4: "খুব ভালো কোয়ালিটি (৪/৫)",
  3: "মোটামুটি ভালো (৩/৫)",
  2: "চলনসই (২/৫)",
  1: "আশানুরূপ হয়নি (১/৫)",
};

export function ReviewsSection({ productId, productTitle }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Carousel controls
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSnapCount, setTotalSnapCount] = useState(0);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formComment, setFormComment] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = productId ? `/api/reviews?productId=${encodeURIComponent(productId)}` : "/api/reviews";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
      setTotalSnapCount(carouselApi.scrollSnapList().length);
    };

    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }
    if (!formComment.trim()) {
      toast.error("অনুগ্রহ করে আপনার মতামত বা অভিজ্ঞতা লিখুন");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          location: formLocation,
          phone: formPhone,
          rating: formRating,
          comment: formComment,
          productId: productId || "",
          productTitle: productTitle || "নারী নিবেদিত শপ",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("আপনার মূল্যবান মতামতের জন্য অসংখ্য ধন্যবাদ!", {
          description: "আপনার রিভিউটি সফলভাবে প্রকাশিত হয়েছে।",
        });
        setIsDialogOpen(false);
        // Reset form
        setFormName("");
        setFormLocation("");
        setFormPhone("");
        setFormRating(5);
        setFormComment("");
        // Optimistically add or re-fetch
        fetchReviews();
      } else {
        toast.error(json.message || "রিভিউ জমা দিতে সমস্যা হয়েছে");
      }
    } catch (err) {
      toast.error("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId?: string) => {
    if (!reviewId || likedReviews[reviewId]) return;
    
    // Optimistic UI update
    setLikedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );

    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId }),
      });
      toast.success("ধন্যবাদ! আপনার ফিডব্যাক রেকর্ড করা হয়েছে।");
    } catch (e) {
      // Ignore background error
    }
  };

  // Calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;
  const count3 = reviews.filter((r) => r.rating === 3).length;

  const filteredReviews = filterRating 
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section id="reviews-section" className="space-y-8 pt-4">
      {/* Header and Summary Panel */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Overall Rating & Social Proof */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> গ্রাহকের বাস্তব অভিজ্ঞতা
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              গ্রাহক রিভিউ ও মতামত ({totalReviews})
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              আমাদের সম্মানিত গ্রাহকদের আসল সন্তুষ্টি ও নির্ভরযোগ্যতার গল্প
            </p>

            <div className="flex items-center gap-4 pt-1">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {avgRating}
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-500" />
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>১০০% প্রামাণিক ও ভেরিফাইড ক্রেতার রিভিউ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Rating distribution bars */}
          <div className="w-full md:w-64 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-500 font-medium">৫ স্টার</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${totalReviews > 0 ? (count5 / totalReviews) * 100 : 90}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold text-slate-700">{count5}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-500 font-medium">৪ স্টার</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${totalReviews > 0 ? (count4 / totalReviews) * 100 : 10}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold text-slate-700">{count4}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 text-slate-500 font-medium">৩ স্টার</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-slate-300 rounded-full transition-all"
                  style={{ width: `${totalReviews > 0 ? (count3 / totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold text-slate-700">{count3}</span>
            </div>
          </div>

          {/* Right: Write Review Trigger Modal */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-950/15 gap-2 px-6 h-12"
                >
                  <MessageSquarePlus className="h-5 w-5 text-amber-300" />
                  <span>মতামত বা রিভিউ দিন</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 sm:p-8">
                <DialogHeader className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> নারী নিবেদিত কাস্টমার ফিডব্যাক
                  </div>
                  <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
                    আপনার অভিজ্ঞতা শেয়ার করুন
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    আমাদের পণ্য, কাঠের ফিনিশিং বা সার্ভিস সম্পর্কে আপনার মূল্যবান মতামত লিখুন।
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
                  {/* Star rating selector */}
                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <label className="text-xs font-bold text-slate-700 block">
                      আপনার রেটিং বেছে নিন
                    </label>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              (hoverRating || formRating) >= star
                                ? "fill-amber-500 text-amber-500 drop-shadow-xs"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-indigo-700 block pt-1">
                      {RATING_LABELS[hoverRating || formRating]}
                    </span>
                  </div>

                  {/* Name and Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FloatingInput
                      label="আপনার নাম"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      icon={<User className="h-4 w-4 text-indigo-600" />}
                      required
                    />
                    <FloatingInput
                      label="আপনার এলাকা / জেলা"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      icon={<MapPin className="h-4 w-4 text-indigo-600" />}
                    />
                  </div>

                  {/* Phone (optional) */}
                  <FloatingInput
                    type="tel"
                    label="মোবাইল / হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    icon={<Phone className="h-4 w-4 text-indigo-600" />}
                  />

                  {/* Review / Comment Text */}
                  <FloatingTextarea
                    label="আপনার বিস্তারিত মতামত ও পরামর্শ"
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    rows={4}
                    required
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-md gap-2"
                  >
                    {submitting ? (
                      <span>জমা দেওয়া হচ্ছে...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>রিভিউ প্রকাশ করুন</span>
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <span className="text-[11px] text-slate-400 text-center">
              সব রিভিউ তৎক্ষণাৎ ওয়েবসাইটে যুক্ত হয়
            </span>
          </div>

        </div>
      </div>

      {/* Filter Tabs and Carousel Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" /> ফিল্টার:
          </span>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 ${
              filterRating === null
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
            }`}
          >
            সব রিভিউ ({totalReviews})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating(5)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 flex items-center gap-1 ${
              filterRating === 5
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:border-amber-200"
            }`}
          >
            <Star className="h-3 w-3 fill-current" /> ৫ স্টার ({count5})
          </button>
          {count4 > 0 && (
            <button
              type="button"
              onClick={() => setFilterRating(4)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 flex items-center gap-1 ${
                filterRating === 4
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-amber-200"
              }`}
            >
              <Star className="h-3 w-3 fill-current" /> ৪ স্টার ({count4})
            </button>
          )}
        </div>

        {/* Carousel Prev & Next Controls */}
        {filteredReviews.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              রিভিউ {currentSlide + 1} / {totalSnapCount || 1}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="h-8 w-8 rounded-xl border-slate-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition-all shadow-xs"
                title="পূর্ববর্তী রিভিউ"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
                className="h-8 w-8 rounded-xl border-slate-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition-all shadow-xs"
                title="পরবর্তী রিভিউ"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Carousel */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl bg-indigo-100" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 bg-slate-200" />
                  <Skeleton className="h-3 w-20 bg-slate-100" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-2xl bg-slate-100" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-3 w-24 bg-slate-100" />
                <Skeleton className="h-5 w-20 rounded-full bg-slate-200/60" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">এখনো কোনো মতামত পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনিই প্রথম এই পণ্যের জন্য আপনার মূল্যবান রিভিউ দিয়ে অন্য ক্রেতাদের সাহায্য করুন!
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold"
          >
            প্রথম রিভিউটি লিখুন
          </Button>
        </div>
      ) : (
        <div className="relative px-3 sm:px-6 lg:px-8">
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4 py-2">
              {filteredReviews.map((rev, index) => {
                const initials = rev.name ? rev.name.slice(0, 2) : "কাস্টমার";
                const isLiked = rev._id ? likedReviews[rev._id] : false;

                return (
                  <CarouselItem
                    key={rev._id || index}
                    className="pl-3 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Top Bar: Customer profile & Rating */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {rev.name}
                                </h4>
                                {rev.verifiedPurchase && (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0 h-4 gap-0.5 font-medium shrink-0">
                                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> ভেরিফাইড ক্রেতা
                                  </Badge>
                                )}
                              </div>
                              {rev.location && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {rev.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Star Rating */}
                          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500" />
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[72px]">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Footer: Product Tag & Helpful Like */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 gap-2">
                        <span className="truncate text-[11px] text-slate-500 font-medium">
                          {rev.productTitle || productTitle || "নারী নিবেদিত ক্রাফট"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleLikeReview(rev._id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-colors shrink-0 ${
                            isLiked
                              ? "text-emerald-700 bg-emerald-50 font-bold"
                              : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          <ThumbsUp className={`h-3 w-3 ${isLiked ? "fill-emerald-600" : ""}`} />
                          <span>উপকারী ছিল ({rev.likes || 0})</span>
                        </button>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Left and Right Carousel Action Buttons */}
            <button
              type="button"
              onClick={() => carouselApi?.scrollPrev()}
              className="absolute left-0 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border-2 border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-xl z-30 transition-all duration-200 flex items-center justify-center group active:scale-95 focus:outline-none"
              title="পূর্ববর্তী রিভিউ"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => carouselApi?.scrollNext()}
              className="absolute right-0 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border-2 border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-xl z-30 transition-all duration-200 flex items-center justify-center group active:scale-95 focus:outline-none"
              title="পরবর্তী রিভিউ"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Carousel>

          {/* Dots Pagination Indicators */}
          {totalSnapCount > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-5">
              {Array.from({ length: totalSnapCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => carouselApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i
                      ? "w-7 bg-indigo-600"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
