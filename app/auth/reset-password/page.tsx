"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, Shield } from "lucide-react"

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "An error occurred")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border border-rose-100 bg-white rounded-3xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mx-auto">
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">পাসওয়ার্ড পরিবর্তন সফল!</h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              আপনার নতুন পাসওয়ার্ড সেট করা হয়েছে। এখন লগইন করতে পারেন।
            </p>
            <Button
              onClick={() => router.push("/auth/signin")}
              className="w-full h-11 bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl"
            >
              লগইন করুন
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border border-rose-100 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-50 text-[#6B112B] rounded-2xl mx-auto border border-rose-100">
              <Shield className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-black text-[#6B112B] font-serif">নতুন পাসওয়ার্ড দিন</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              আপনার একাউন্টের জন্য শক্তিশালী নতুন পাসওয়ার্ড নির্বাচন করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <FloatingInput
                  type={showPassword ? "text" : "password"}
                  label="নতুন পাসওয়ার্ড (New Password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6B112B] z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <FloatingInput
                  type={showConfirmPassword ? "text" : "password"}
                  label="পুনরায় নতুন পাসওয়ার্ড দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6B112B] z-10"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl text-sm shadow-md"
                disabled={isLoading || !token}
              >
                {isLoading ? "সংরক্ষণ হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-xs font-semibold text-[#6B112B] hover:underline"
              >
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-rose-50/40 text-xs text-[#6B112B] font-bold">লোড হচ্ছে...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
