'use client'

import React, { useState } from 'react'
import { Card } from '@/app/page'

interface TradeCardProps {
  card: Card
  type: 'yes' | 'no'
  nominal: number
  onNominalChange: (value: number) => void
  onTrade: () => void
  onSwipe?: (direction: 'left' | 'right') => void
}

export default function TradeCard({
  card,
  type,
  nominal,
  onNominalChange,
  onTrade,
  onSwipe,
}: TradeCardProps) {
  const isYes = type === 'yes'
  const bgColor = isYes ? 'from-[#2A8300] to-[#94E172]' : 'from-[#CC0D00] to-[#FE7B72]'
  const textColor = isYes ? 'text-[#2A8300]' : 'text-[#CC0D00]'
  const buttonColor = isYes ? 'bg-[#2A8300] hover:bg-[#94E172]' : 'bg-[#CC0D00] hover:bg-[#FE7B72]'
  const labelBg = isYes ? 'bg-[#94E172]' : 'bg-[#FE7B72]'

  const handleIncrement = () => onNominalChange(nominal + 100000)
  const handleDecrement = () => onNominalChange(Math.max(0, nominal - 100000))

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toLocaleString()
  }

  return (
    <div
      className={`relative w-full h-full rounded-4xl shadow-2xl flex flex-col items-center justify-between p-8 bg-gradient-to-br ${bgColor} overflow-hidden`}
      onTouchStart={(e) => {
        const startX = e.touches[0].clientX
        const startY = e.touches[0].clientY
        let isDragging = true

        const handleTouchEnd = (endEvent: TouchEvent) => {
          if (!isDragging) return
          isDragging = false

          const endX = endEvent.changedTouches[0].clientX
          const endY = endEvent.changedTouches[0].clientY

          const diffX = endX - startX
          const diffY = endY - startY

          if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 80 && isYes && onSwipe) {
              onSwipe('right')
            } else if (diffX < -80 && !isYes && onSwipe) {
              onSwipe('left')
            }
          }
        }

        document.addEventListener('touchend', handleTouchEnd)
        return () => document.removeEventListener('touchend', handleTouchEnd)
      }}
    >
      {/* Label - Top */}
      <div className={`absolute top-8 left-8 ${labelBg} text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg border-2 border-white border-opacity-40`}>
        {isYes ? '✓ YES' : '✕ NO'}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full space-y-10">
        {/* Currency Display - Larger */}
        <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-3xl px-10 py-8 border-3 border-white border-opacity-40 w-4/5">
          <p className="text-white text-opacity-90 text-base font-semibold mb-3">Your Stake ({isYes ? 'YES' : 'NO'})</p>
          <p className="text-white text-6xl font-bold font-mono tracking-tighter">${formatCurrency(nominal)}</p>
          <p className="text-white text-opacity-80 text-sm mt-3 font-medium">IDRX Tokens</p>
        </div>

        {/* Increment/Decrement Buttons - Larger */}
        <div className="flex gap-6">
          <button
            onClick={handleDecrement}
            className="w-20 h-20 rounded-full bg-white bg-opacity-35 hover:bg-opacity-45 text-white text-4xl font-bold transition-all active:scale-95 shadow-lg border-2 border-white border-opacity-50"
          >
            −
          </button>
          <button
            onClick={handleIncrement}
            className="w-20 h-20 rounded-full bg-white bg-opacity-35 hover:bg-opacity-45 text-white text-4xl font-bold transition-all active:scale-95 shadow-lg border-2 border-white border-opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Trade Button - Bottom */}
      <button
        onClick={onTrade}
        className={`w-4/5 py-6 rounded-3xl ${buttonColor} text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all active:scale-95 border-2 border-white border-opacity-40`}
      >
        🚀 Trade
      </button>

      {/* Swipe Hint */}
      <div className="absolute bottom-24 left-0 right-0 text-center">
        <p className="text-white text-opacity-80 text-sm font-semibold">
          {isYes ? 'Swipe → to confirm' : 'Swipe ← to confirm'}
        </p>
      </div>
    </div>
  )
}
