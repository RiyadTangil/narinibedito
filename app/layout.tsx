import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export const metadata: Metadata = {
  title: 'নারী নিবেদিত | Nari Nibedito -নারীদের জন্য',
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
  themeColor: '#0F172A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50/40 text-slate-900 antialiased selection:bg-indigo-600/15 selection:text-indigo-700">
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
