"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Determine correct redirect destination: always prefer /admin over legacy /dashboard
  const rawCallback = searchParams.get("callbackUrl");
  const getDestinationUrl = () => {
    if (rawCallback && !rawCallback.startsWith("/dashboard") && rawCallback !== "/") {
      return rawCallback;
    }
    return "/admin";
  };

  // Redirect to admin panel if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user && (session as any)?.error !== "UserDeletedOrInactive") {
      router.push(getDestinationUrl());
    }
  }, [status, session, rawCallback, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF5F7] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#D4AF37] p-1 bg-white shadow-xl animate-pulse">
            <Image
              src="/images/logo.jpg"
              alt="নারী নিবেদিত"
              fill
              className="object-contain rounded-full"
              priority
            />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#6B112B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#6B112B] font-bold text-sm tracking-wide font-serif">লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render form if already authenticated
  if (status === "authenticated" && (session as any)?.error !== "UserDeletedOrInactive") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Redirect directly to /admin panel
        window.location.href = getDestinationUrl();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#6B112B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border border-rose-100 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden">
          
          <CardHeader className="text-center pt-8 pb-4 space-y-3">
            {/* Brand Logo */}
            <div className="mx-auto relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#D4AF37] p-1 bg-white shadow-md">
              <Image
                src="/images/logo.jpg"
                alt="নারী নিবেদিত"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-black text-[#6B112B] tracking-tight font-serif">
                নারী নিবেদিত
              </CardTitle>
              <CardDescription className="text-xs text-[#B8860B] font-semibold">
                এডমিন প্যানেলে লগইন করুন
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FloatingInput
                type="email"
                label="ইমেইল অ্যাড্রেস (Email Address)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4 text-slate-400" />}
                required
              />

              <div className="relative">
                <FloatingInput
                  type={showPassword ? "text" : "password"}
                  label="পাসওয়ার্ড (Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4 text-slate-400" />}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6B112B] transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">লগইন পরবর্তী পেজ: <strong className="text-[#6B112B]">/admin</strong></span>
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-[#6B112B] hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-bold bg-[#6B112B] hover:bg-[#50091D] text-white shadow-md shadow-rose-950/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    লগইন হচ্ছে...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>এডমিন প্যানেলে প্রবেশ করুন</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-[#6B112B] transition-colors font-medium"
              >
                ← মূল ওয়েবসাইটে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400">
            নারী নিবেদিত • সৌন্দর্য • রুচি • ভালোবাসা
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6B112B] border-t-transparent"></div>
        <p className="text-[#6B112B] text-xs font-semibold">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
