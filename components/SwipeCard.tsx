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
  const [nominal, setNominal] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })

  // Data helpers
  const yesPercentage = card.yesPercentage || 50
  const noPercentage = card.noPercentage || 50
  const volume = card.volume || '0 IDRX'
  const category = card.category || 'General'
  const isNew = card.isNew === true

  // Handle Double Tap
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

    // Animasi drag sederhana
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${deltaX * 0.5}px) translateY(${deltaY * 0.5}px)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const swipeThreshold = 80
    const swipeUpThreshold = 150

    // Logic Yellow Card (Kartu Utama)
    if (cardState === 'yellow') {
      // Swipe Up - SKIP
      if (dragY < -swipeUpThreshold) {
        animateSwipeUp()
        return
      }

      // Swipe Right - Trigger GREEN Mode
      if (dragX > swipeThreshold) {
        setCardState('green')
        resetPosition()
        return
      }

      // Swipe Left - Trigger RED Mode
      if (dragX < -swipeThreshold) {
        setCardState('red')
        resetPosition()
        return
      }
    }

    // Logic Confirmation Cards (Red/Green)
    if (cardState === 'red') {
      // Confirm NO (Swipe Left again)
      if (dragX < -swipeThreshold) {
        animateSwipeLeft()
        return
      }
      // Cancel (Swipe Right)
      if (dragX > swipeThreshold) {
        setCardState('yellow')
        resetPosition()
        return
      }
    }

    if (cardState === 'green') {
      // Confirm YES (Swipe Right again)
      if (dragX > swipeThreshold) {
        animateSwipeRight()
        return
      }
      // Cancel (Swipe Left)
      if (dragX < -swipeThreshold) {
        setCardState('yellow')
        resetPosition()
        return
      }
    }

    resetPosition()
  }

  // --- Animation Helpers ---
  const animateSwipeUp = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s ease-out'
      containerRef.current.style.transform = 'translateY(-100vh) rotate(0deg)' // Lempar jauh ke atas
      setTimeout(() => {
        resetCardState()
        onSwipeUp()
      }, 300)
    }
  }

  const animateSwipeRight = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.5s ease-out'
      containerRef.current.style.transform = 'translateX(100vw) rotate(30deg)'
      setTimeout(() => {
        resetCardState()
        onSwipeRight(nominal)
      }, 300)
    }
  }

  const animateSwipeLeft = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.5s ease-out'
      containerRef.current.style.transform = 'translateX(-100vw) rotate(-30deg)'
      setTimeout(() => {
        resetCardState()
        onSwipeLeft(nominal)
      }, 300)
    }
  }

  const resetPosition = () => {
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.3s ease-out'
      containerRef.current.style.transform = 'translateX(0) translateY(0) rotate(0deg)'
      setDragX(0)
      setDragY(0)
    }
  }

  const resetCardState = () => {
    // Reset visual state for the next card reuse
    resetPosition()
    setCardState('yellow')
    setDragX(0)
    setDragY(0)
  }
  
  // Handler untuk TradeCard Component
  const handleTrade = () => {
      if (cardState === 'green') animateSwipeRight()
      if (cardState === 'red') animateSwipeLeft()
  }

  const handleSwipeCard = (direction: 'left' | 'right') => {
      if (direction === 'right' && cardState === 'green') animateSwipeRight()
      if (direction === 'left' && cardState === 'red') animateSwipeLeft()
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
          className="absolute inset-0 rounded-4xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden bg-white border-4 border-yellow-300"
          style={{
             background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF59D 100%)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${card.status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {card.status || 'Upcoming'}
            </span>
            {isNew && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">NEW</span>}
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mt-2 z-10">{card.title}</h2>

          {/* Image */}
          <div className="flex-1 my-4 relative rounded-2xl overflow-hidden shadow-inner bg-gray-200">
             <img src={card.image} alt="prediction" className="object-cover w-full h-full" />
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          {/* Stats */}
          <div className="z-10">
             <div className="flex justify-between items-center mb-3">
                <div className="text-center w-1/2 border-r border-gray-300">
                   <div className="text-2xl font-black text-green-600">{yesPercentage}%</div>
                   <div className="text-xs text-gray-500 font-bold uppercase">YES Pool</div>
                </div>
                <div className="text-center w-1/2">
                   <div className="text-2xl font-black text-red-500">{noPercentage}%</div>
                   <div className="text-xs text-gray-500 font-bold uppercase">NO Pool</div>
                </div>
             </div>
             <div className="flex justify-between text-xs font-bold text-gray-400 border-t border-gray-200 pt-3">
                 <span>{volume}</span>
                 <span>{category}</span>
             </div>
          </div>
        </div>
      )}

      {/* Trade Card (Overlay) */}
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