"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, Loader2, Link2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  className?: string;
  aspectRatio?: "square" | "banner";
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  required = false,
  className = "",
  aspectRatio = "square",
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP ইত্যাদি) নির্বাচন করুন");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ছবির সাইজ সর্বোচ্চ ১০ MB হতে পারবে");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "ছবি আপলোড ব্যর্থ হয়েছে");
      }

      const uploadedUrl = json.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success("ছবি সফলভাবে আপলোড হয়েছে");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "ছবি আপলোডে সমস্যা হয়েছে");
    } finally {
      setIsUploading(false);
      // Reset input value so re-selecting the same file fires onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </Label>
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
        >
          <Link2 className="h-3 w-3" />
          {showUrlField ? "URL লুকান" : "অথবা ছবির URL দিন"}
        </button>
      </div>

      {/* Main Upload / Preview Area */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Preview Thumbnail */}
        <div
          className={`sm:col-span-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group ${
            aspectRatio === "banner" ? "h-24 sm:h-28" : "h-28 sm:h-32"
          }`}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt="Uploaded preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7 rounded-full shadow-md"
                  onClick={() => onChange("")}
                  title="ছবি মুছুন"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="absolute bottom-1 right-1 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" /> সিলেক্টেড
              </span>
            </>
          ) : (
            <div className="text-center p-3 text-slate-400">
              <ImageIcon className="h-7 w-7 mx-auto mb-1 stroke-1" />
              <span className="text-[10px] block">কোনো ছবি নেই</span>
            </div>
          )}
        </div>

        {/* Action Buttons & Dropzone */}
        <div className="sm:col-span-8 flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-11 border-dashed border-2 border-indigo-300 hover:border-indigo-600 hover:bg-indigo-50/50 bg-white text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>MongoDB-তে আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 text-indigo-600" />
                <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
              </>
            )}
          </Button>

          <p className="text-[11px] text-slate-500 leading-tight">
            JPG, PNG, WEBP ফাইল নির্বাচন করুন (সর্বোচ্চ ১০ MB)। ছবি সরাসরি ডাটাবেসে সংরক্ষিত হবে।
          </p>
        </div>
      </div>

      {/* Optional Direct URL Input Field */}
      {showUrlField && (
        <div className="pt-1 transition-all">
          <div className="relative">
            <input
              type="text"
              placeholder="https://example.com/image.jpg বা /images/products/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            সরাসরি কোনো ওয়েবসাইটের ছবির লিংক ব্যবহার করতে চাইলে এখানে পেস্ট করুন।
          </span>
        </div>
      )}
    </div>
  );
}

