'use client'

import React, { useState, useRef } from 'react'
import { Card } from '@/app/page'
import TradeCard from './TradeCard'

interface SwipeCardProps {
  card: Card
  onSwipeRight: (nominal: number) => void
  onSwipeLeft: (nominal: number) => void
  onSwipeUp: () => void
  onDoubleTap: () => void
}

type CardState = 'yellow' | 'red' | 'green'

export default function SwipeCard({
  card,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onDoubleTap,
}: SwipeCardProps) {
  const [cardState, setCardState] = useState<CardState>('yellow')
  const [nominal, setNominal] = useState(500000)
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })

  const yesPercentage = card.yesPercentage || 32
  const noPercentage = card.noPercentage || 68
  const volume = card.volume || '$1m'
  const category = card.category || 'Sports - Football - LaLiga'
  const status = card.status || 'Open • Ends in 3d'
  const isNew = card.isNew !== false

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapTime

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (cardState === 'yellow') {
        onDoubleTap()
      }
      return
    }

    setLastTapTime(now)
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    touchStartRef.current = { x: clientX, y: clientY, time: now }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return

    const currentX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const deltaX = currentX - touchStartRef.current.x
    const deltaY = currentY - touchStartRef.current.y

    setDragX(deltaX)
    setDragY(deltaY)

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${deltaX * 0.5}px) translateY(${deltaY * 0.5}px)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const swipeThreshold = 80
    const swipeUpThreshold = 150

    // Yellow Card States
    if (cardState === 'yellow') {
      // Swipe Up - SKIP to next card
      if (dragY < -swipeUpThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.4s ease-out'
          containerRef.current.style.transform = 'translateY(-500px) rotate(0deg)'
          setTimeout(() => {
            resetCard()
            onSwipeUp()
          }, 400)
        }
        return
      }

      // Swipe Right - Show green card
      if (dragX > swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.4s ease-out'
          containerRef.current.style.transform = `translateX(100px) rotate(5deg)`
        }
        setCardState('green')
        setDragX(0)
        setDragY(0)
        return
      }

      // Swipe Left - Show red card
      if (dragX < -swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.4s ease-out'
          containerRef.current.style.transform = `translateX(-100px) rotate(-5deg)`
        }
        setCardState('red')
        setDragX(0)
        setDragY(0)
        return
      }
    }

    // Red/Green Card States
    if (cardState === 'red') {
      // Swipe Left - Complete NO trade
      if (dragX < -swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.5s ease-out'
          containerRef.current.style.transform = 'translateX(-500px) rotate(-30deg)'
          setTimeout(() => {
            resetCard()
            onSwipeLeft(nominal)
          }, 500)
        }
        return
      }

      // Swipe Right - Go back to yellow
      if (dragX > swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.3s ease-out'
          containerRef.current.style.transform = 'translateX(0) rotate(0deg)'
        }
        setCardState('yellow')
        setDragX(0)
        setDragY(0)
        return
      }
    }

    if (cardState === 'green') {
      // Swipe Right - Complete YES trade
      if (dragX > swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.5s ease-out'
          containerRef.current.style.transform = 'translateX(500px) rotate(30deg)'
          setTimeout(() => {
            resetCard()
            onSwipeRight(nominal)
          }, 500)
        }
        return
      }

      // Swipe Left - Go back to yellow
      if (dragX < -swipeThreshold) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.3s ease-out'
          containerRef.current.style.transform = 'translateX(0) rotate(0deg)'
        }
        setCardState('yellow')
        setDragX(0)
        setDragY(0)
        return
      }
    }

    // Reset if threshold not reached
    resetCard()
  }

  const resetCard = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.3s ease-out'
      containerRef.current.style.transform = 'translateX(0) translateY(0) rotate(0deg)'
    }
    setDragX(0)
    setDragY(0)
  }

  const handleTouchCancel = () => {
    setIsDragging(false)
    resetCard()
  }

  const handleTrade = () => {
    if (cardState === 'red') {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.5s ease-out'
        containerRef.current.style.transform = 'translateX(-500px) rotate(-30deg)'
        setTimeout(() => {
          resetCard()
          setCardState('yellow')
          onSwipeLeft(nominal)
        }, 500)
      }
    } else if (cardState === 'green') {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.5s ease-out'
        containerRef.current.style.transform = 'translateX(500px) rotate(30deg)'
        setTimeout(() => {
          resetCard()
          setCardState('yellow')
          onSwipeRight(nominal)
        }, 500)
      }
    }
  }

  const handleSwipeCard = (direction: 'left' | 'right') => {
    if (direction === 'right' && cardState === 'green') {
      handleTrade()
    } else if (direction === 'left' && cardState === 'red') {
      handleTrade()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translateX(${dragX * 0.3}px) translateY(${dragY * 0.3}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        width: '90vw',
        maxWidth: '390px',
        aspectRatio: '2 / 3',
        margin: '0 auto',
      }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Yellow Card */}
      {cardState === 'yellow' && (
        <div
          className="absolute inset-0 rounded-4xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F7E595 0%, #F0C155 100%)',
          }}
        >
          {/* Top Section - Status & New Badge */}
          <div className="flex items-center justify-between w-full gap-4 z-10">
            <div className="bg-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md border-2" style={{ borderColor: '#5799E9', color: '#5799E9' }}>
              {status}
            </div>
            {isNew && (
              <div className="text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}>
                New
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="text-center z-10 mt-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{card.title}</h2>
          </div>

          {/* Image Section - Prominent with Overlay */}
          <div className="w-full flex-1 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl flex flex-col items-center justify-between border-3 border-gray-700 shadow-xl overflow-hidden relative my-2">
            {/* Image Background Placeholder */}
            <div className="absolute inset-0 bg-gray-800 opacity-60"></div>
            
            {/* Teams/Logo Section */}
            <div className="relative w-full flex-1 flex items-center justify-center gap-6 pt-6">
              <div className="text-center">
                <div className="text-5xl mb-2">⚽</div>
                <div className="text-sm text-white font-bold text-center">Team 1</div>
              </div>
              <div className="text-white text-2xl font-bold">VS</div>
              <div className="text-center">
                <div className="text-5xl mb-2">⚽</div>
                <div className="text-sm text-white font-bold text-center">Team 2</div>
              </div>
            </div>

            {/* Date/Time and Location Info */}
            <div className="relative w-full bg-black bg-opacity-60 px-4 py-4 text-center space-y-1.5">
              <div className="text-sm text-white font-semibold">27 Oktober 2024 | Pukul 02.00 WIB</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📍</span>
                <span className="text-sm text-white font-semibold">Santiago Bernabéu</span>
              </div>
            </div>
          </div>

          {/* Bottom Section - Percentages, Volume, Category */}
          <div className="w-full space-y-3.5 z-10">
            {/* Percentage Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="py-5 px-3 rounded-3xl font-bold transition-all active:scale-95 shadow-lg border-2 border-[#FE7B72] bg-[#FE7B72] text-[#CC0D00] hover:bg-[#CC0D00] hover:text-white flex items-center justify-center gap-2">
                <span className="text-2xl font-black">{noPercentage}%</span>
                <span className="text-2xl font-black">No</span>
              </button>
              <button className="py-5 px-3 rounded-3xl font-bold transition-all active:scale-95 shadow-lg border-2 border-[#94E172] bg-[#94E172] text-[#2A8300] hover:bg-[#2A8300] hover:text-white flex items-center justify-center gap-2">
                <span className="text-2xl font-black">{yesPercentage}%</span>
                <span className="text-2xl font-black">Yes</span>
              </button>
            </div>

            {/* Volume and Category - Bottom */}
            <div className="text-sm text-gray-800 font-bold text-center space-y-1">
              <div>{volume} Vol</div>
              <div>{category}</div>
            </div>
          </div>
        </div>
      )}

      {/* Red/Green Trade Card (Behind) */}
      {cardState !== 'yellow' && (
        <div className="absolute inset-0">
          <TradeCard
            card={card}
            type={cardState === 'green' ? 'yes' : 'no'}
            nominal={nominal}
            onNominalChange={setNominal}
            onTrade={handleTrade}
            onSwipe={handleSwipeCard}
          />
        </div>
      )}
    </div>
  )
}
