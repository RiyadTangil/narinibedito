"use client";

import Image from "next/image";
import { AlertTriangle, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemSku?: string;
  itemImage?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "পণ্যটি ডিলিট করতে চান?",
  description = "এই পণ্যটি মুছে ফেললে ওয়েবসাইট ক্যাটালগ ও ইনভেন্টরি থেকে অপসারিত হবে।",
  itemName,
  itemSku,
  itemImage,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-6 gap-3 sm:gap-4 bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-2.5 sm:space-y-3 text-center sm:text-center">
          {/* Warning Icon Badge */}
          <div className="mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 animate-pulse" />
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug break-words">
            {title}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed break-words">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Item Preview Card */}
        {itemName && (
          <div className="my-1 sm:my-2 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 min-w-0">
            {itemImage && (
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                <Image
                  src={itemImage}
                  alt={itemName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {itemName}
              </span>
              {itemSku && (
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  SKU: {itemSku}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 sm:pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="flex-1 rounded-xl h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            বাতিল করুন
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-600/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>{loading ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
