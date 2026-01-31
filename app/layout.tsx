import React from "react"
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/Providers' // 👈 1. Import Providers yang baru dibuat

const _poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Titen - Predictions market',
  description: 'Swipe to predict and trade',
  generator: 'v0.app',
  icons: {
    icon: '/Logo-Titen.png',
    apple: '/Logo-Titen.png',
  },
  other: {
    'base:app_id': '6975d3793a92926b661fd488',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Jika ingin font Poppins aktif, biasanya tambahkan _poppins.className di sini */}
      <body className={`font-sans antialiased ${_poppins.className}`}>

        {/* 👇 2. Bungkus aplikasi (children) dengan Providers */}
        <Providers>
          {children}
        </Providers>

        <Analytics />
      </body>
    </html>
  )
}