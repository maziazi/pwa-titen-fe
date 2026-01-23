'use client'

import React, { useEffect, useState } from 'react'
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
  const labelBg = isYes ? 'bg-[#94E172]' : 'bg-[#FE7B72]'
  const labelText = isYes ? '✓ YES' : '✕ NO'
  const MAX_DIGITS = 9
  const MAX_VALUE = 10 ** MAX_DIGITS - 1

  const [inputValue, setInputValue] = useState('0')

  useEffect(() => {
    const clamped = Math.min(nominal, MAX_VALUE)
    setInputValue(clamped.toString())
  }, [nominal])

  const handleInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '')
    const limited = cleaned.slice(0, MAX_DIGITS)

    if (limited === '') {
      setInputValue('0')
      onNominalChange(0)
      return
    }

    const normalizedNumber = parseInt(limited, 10)
    setInputValue(normalizedNumber.toString())
    onNominalChange(normalizedNumber)
  }

  const handleInputFocus = () => {}

  const handleInputBlur = () => {
    if (inputValue === '') {
      setInputValue('0')
      onNominalChange(0)
    }
  }

  const formattedAmount = inputValue === '' ? '' : Number(inputValue).toLocaleString('en-US')
  const amountLength = formattedAmount === '' ? 1 : formattedAmount.length
  const amountFontSize = amountLength > 11 ? 'text-lg' : amountLength > 9 ? 'text-xl' : amountLength > 7 ? 'text-2xl' : amountLength > 5 ? 'text-3xl' : 'text-4xl'

  const handleIncrement = () => onNominalChange(Math.min(MAX_VALUE, nominal + 1))
  const handleDecrement = () => onNominalChange(Math.max(0, nominal - 1))

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toLocaleString()
  }

  // Calculate potential profit - if win
  const potentialWin = nominal * 1.5
  const formattedWin = Number.isFinite(potentialWin) ? potentialWin.toLocaleString('en-US') : '0'
  const winLength = formattedWin.length
  const winFontSize = winLength > 12 ? 'text-2xl' : winLength > 10 ? 'text-3xl' : winLength > 8 ? 'text-4xl' : 'text-5xl'

  return (
    <div
      className={`relative w-full h-full rounded-4xl shadow-2xl flex flex-col items-center justify-between p-6 bg-gradient-to-br ${bgColor} overflow-hidden`}
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
      {/* Top - Label Small */}
      <div className={`${labelBg} text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg`}>
        {labelText}
      </div>

      {/* Main Content - Input Section */}
      <div className="flex flex-col items-center justify-center flex-1 w-full space-y-4">
        {/* Amount Card */}
        <div className="w-[95%] bg-white bg-opacity-15 backdrop-blur-sm rounded-3xl p-4 space-y-3 border border-white border-opacity-20">
          {/* Amount Label */}
          <div className="flex items-center justify-center">
            <span className={`text-sm font-semibold ${isYes ? 'text-gray-800' : 'text-gray-900'}`}>Amount</span>
          </div>

          {/* Increment/Decrement with Amount Value */}
          <div className="flex items-center justify-between w-full px-0">
            <button
              onClick={handleDecrement}
              aria-label="Decrease amount"
              className={`p-2 rounded-full transition-all active:scale-95 ${isYes ? 'text-gray-800 hover:text-gray-900' : 'text-gray-900 hover:text-black'}`}
              title="Decrease"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>
            <div className="flex flex-col items-center flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formattedAmount}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`${amountFontSize} font-bold font-mono text-center bg-transparent border-b-2 border-gray-400 focus:border-gray-700 focus:outline-none w-full max-w-[24rem] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[36rem] transition-all px-2 ${
                  nominal > 0 ? (isYes ? 'text-gray-900' : 'text-gray-900') : (isYes ? 'text-gray-400' : 'text-gray-500')
                }`}
              />
              <span className={`text-sm font-semibold mt-3 ${isYes ? 'text-gray-700' : 'text-gray-800'}`}>IDRX</span>
            </div>
            <button
              onClick={handleIncrement}
              aria-label="Increase amount"
              className={`p-2 rounded-full transition-all active:scale-95 ${isYes ? 'text-gray-800 hover:text-gray-900' : 'text-gray-900 hover:text-black'}`}
              title="Increase"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* To Win Card - Only show if nominal > 0 */}
        {nominal > 0 && (
          <div className="w-[95%] bg-white bg-opacity-15 backdrop-blur-sm rounded-3xl p-4 space-y-3 border border-white border-opacity-20">
            {/* To Win Header: left label, right avg price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold ${isYes ? 'text-gray-800' : 'text-gray-900'}`}>To win</span>
              </div>
              <div className={`text-xs ${isYes ? 'text-gray-600' : 'text-gray-700'}`}>Avg. Price 1.5x</div>
            </div>
            <div className="text-center">
              <p className={`${winFontSize} font-bold font-mono ${isYes ? 'text-gray-900' : 'text-gray-900'}`}>
                {formattedWin}
              </p>
              <p className={`text-sm font-semibold mt-3 ${isYes ? 'text-gray-700' : 'text-gray-800'}`}>IDRX</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom - Trade Button Blue Gradient */}
      <button
        onClick={onTrade}
        className="w-5/6 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}
      >
        TRADE
      </button>

      {/* Swipe Hint */}
    </div>
  )
}
