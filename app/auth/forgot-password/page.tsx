"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border border-slate-200 bg-white rounded-3xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mx-auto">
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">ইমেইল চেক করুন</h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              আপনার ইমেইলে পাসওয়ার্ড রিসেট করার লিংক পাঠানো হয়েছে।
            </p>
            <Link href="/auth/signin" className="block pt-2">
              <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                লগইন পেজে ফিরে যান
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border border-slate-200 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pt-8 pb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto border border-indigo-100">
              <KeyRound className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 font-serif">পাসওয়ার্ড রিসেট</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              আপনার রেজিস্টার্ড ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠিয়ে দেবো
            </CardDescription>
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
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
