"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, User, ArrowRight, MapPin, Lock, Building, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    companyAddress: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const submitData = new FormData()
    submitData.append("name", formData.name)
    submitData.append("email", formData.email)
    submitData.append("password", formData.password)
    submitData.append("companyName", formData.companyName)
    submitData.append("companyAddress", formData.companyAddress)
    submitData.append("companyEmail", formData.email)
    submitData.append("companyMobile", "0000000000")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorMsg = data.error?.message || data.message || "An error occurred"
        setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg))
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border border-rose-100 bg-white/95 backdrop-blur-md rounded-3xl">
            <CardContent className="pt-8 px-6 sm:px-8 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 rounded-2xl mb-6 shadow-sm">
                <Mail className="h-10 w-10 text-[#6B112B]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 font-serif">ইমেইল ভেরিফাই করুন</h1>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                আপনার একাউন্ট সফলভাবে তৈরি হয়েছে। ভেরিফিকেশন লিংক পাঠানো হয়েছে:
              </p>
              <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 mb-6">
                <span className="text-[#6B112B] font-semibold break-all text-sm">{formData.email}</span>
              </div>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full h-12 bg-[#6B112B] hover:bg-[#50091D] text-white font-bold rounded-xl"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                লগইন পেজে যান
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9FA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 my-6">
        <Card className="shadow-2xl border border-rose-100 bg-white/95 backdrop-blur-md rounded-3xl">
          <CardHeader className="pb-2 pt-7 text-center">
            <div 
              className="mx-auto relative w-20 h-20 mb-2 cursor-pointer rounded-full overflow-hidden border-2 border-[#D4AF37] p-1 bg-white shadow-md"
              onClick={() => setLogoClickCount(prev => prev + 1)}
            >
              <Image
                src="/images/logo.jpg"
                alt="নারী নিবেদিত"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            <h2 className="text-xl font-black text-[#6B112B] font-serif">নতুন একাউন্ট তৈরি করুন</h2>
          </CardHeader>
          <CardContent className="space-y-4 px-5 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FloatingInput
                type="text"
                label="আপনার নাম (Full Name)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={<User className="h-4 w-4" />}
                required
              />

              <FloatingInput
                type="email"
                label="ইমেইল অ্যাড্রেস (Email Address)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <FloatingInput
                type="text"
                label="প্রতিষ্ঠানের নাম (Store / Company Name)"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                icon={<Building className="h-4 w-4" />}
                required
              />

              <FloatingInput
                type="text"
                label="ঠিকানা (Address)"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                icon={<MapPin className="h-4 w-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <FloatingInput
                    type={showPassword ? "text" : "password"}
                    label="পাসওয়ার্ড (Password)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    icon={<Lock className="h-4 w-4" />}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6B112B] z-10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <FloatingInput
                    type={showConfirmPassword ? "text" : "password"}
                    label="পুনরায় পাসওয়ার্ড"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    icon={<Lock className="h-4 w-4" />}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6B112B] z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {logoClickCount >= 10 && (
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#6B112B] hover:bg-[#50091D] text-white font-bold text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "প্রসেসিং..." : "রেজিস্ট্রেশন সম্পন্ন করুন"}
                </Button>
              )}

              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  ইতিমধ্যে একাউন্ট আছে?{" "}
                  <Link href="/auth/signin" className="font-bold text-[#6B112B] hover:underline">
                    লগইন করুন
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
