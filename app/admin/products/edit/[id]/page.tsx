"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductRedirect({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolved = use(params);

  useEffect(() => {
    if (resolved?.id) {
      router.replace(`/admin/products/add?id=${resolved.id}`);
    }
  }, [resolved, router]);

  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 text-[#6B112B] animate-spin" />
      <p className="text-sm font-semibold text-slate-700">লোড হচ্ছে...</p>
    </div>
  );
}
