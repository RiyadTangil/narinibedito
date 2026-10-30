import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export const metadata: Metadata = {
  title: 'নারী নিবেদিত | Nari Nibedito - সৌন্দর্য • রুচি • ভালোবাসা',
  description: 'নারী নিবেদিত - নারীর সৌন্দর্য, রুচি ও ভালোবাসার বিশ্বস্ত ঠিকানা। এক্সক্লুসিভ কাঠের চুড়ি আলনা, জুয়েলারি বক্স, কাস্টমাইজড হোম ডেকোর, মন্দির ও ফ্যাশন পোশাক।',
  icons: {
    icon: [
      { url: '/images/logo.jpg' },
      { url: '/images/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/images/logo.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    shortcut: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
}

// Mobile browser chrome color + notch / home-indicator safe areas
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5A0D22',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#FFFDFD] text-slate-900 antialiased selection:bg-[#8B1E3F]/15 selection:text-[#8B1E3F]">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  )
}
