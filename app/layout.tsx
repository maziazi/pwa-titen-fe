import React from "react"
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/Providers' // 👈 1. Import Providers yang baru dibuat

const _poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PredictionsHome',
  description: 'Swipe to predict and trade',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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