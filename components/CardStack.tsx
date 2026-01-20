'use client'

import React, { useState, useRef, useEffect } from 'react'
import SwipeCard from './SwipeCard'

interface Card {
  id: string
  title: string
  symbol: string
  description?: string
}

interface CardStackProps {
  cards: Card[]
  onCardDoubleTap: (card: Card) => void
  onTransaction?: (transaction: any) => void
}

export default function CardStack({ 
  cards, 
  onCardDoubleTap,
  onTransaction 
}: CardStackProps) {
  const [cardStack, setCardStack] = useState(cards)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])

  const handleSwipeRight = (nominal: number) => {
    // YES action - swipe right
    const currentCard = cardStack[activeCardIndex]
    const transaction = {
      card: currentCard,
      action: 'YES',
      nominal,
      timestamp: new Date(),
    }
    setTransactionHistory([...transactionHistory, transaction])
    if (onTransaction) {
      onTransaction(transaction)
    }
    
    // Move to next card
    if (activeCardIndex < cardStack.length - 1) {
      setActiveCardIndex(activeCardIndex + 1)
    } else {
      // Reset to beginning
      setActiveCardIndex(0)
      setCardStack([...cards])
    }
  }

  const handleSwipeLeft = (nominal: number) => {
    // NO action - swipe left
    const currentCard = cardStack[activeCardIndex]
    const transaction = {
      card: currentCard,
      action: 'NO',
      nominal,
      timestamp: new Date(),
    }
    setTransactionHistory([...transactionHistory, transaction])
    if (onTransaction) {
      onTransaction(transaction)
    }
    
    // Move to next card
    if (activeCardIndex < cardStack.length - 1) {
      setActiveCardIndex(activeCardIndex + 1)
    } else {
      setActiveCardIndex(0)
      setCardStack([...cards])
    }
  }

  const handleSwipeUp = () => {
    // SKIP action - swipe up
    if (activeCardIndex < cardStack.length - 1) {
      setActiveCardIndex(activeCardIndex + 1)
    } else {
      setActiveCardIndex(0)
      setCardStack([...cards])
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pb-24" style={{ backgroundColor: '#FCF9E1' }}>
      {/* Card Stack Container */}
      <div className="relative w-full flex-1 flex items-center justify-center px-3">
        {/* Stack of cards */}
        {cardStack.map((card, index) => {
          const offset = index - activeCardIndex
          const isActive = offset === 0
          const isBehind = offset > 0
          
          // Calculate rotation and position for stacked effect
          let rotation = 0
          let yOffset = 0
          let xOffset = 0
          let opacity = 1
          let scale = 1
          let zIndex = 50 - index

          if (isBehind) {
            // Cards behind get stacked with rotation and better layering
            rotation = offset * 6
            yOffset = offset * 18
            xOffset = offset * 8
            scale = 0.94 - offset * 0.015
            opacity = 0.75 - offset * 0.12
          }

          return (
            <div
              key={card.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateY(${yOffset}px) translateX(${xOffset}px) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              {isActive ? (
                <SwipeCard 
                  card={card}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeUp={handleSwipeUp}
                  onDoubleTap={() => onCardDoubleTap(card)}
                />
              ) : (
                <div 
                  className="rounded-3xl shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #F7E595 0%, #F0C155 100%)',
                    width: '90vw',
                    maxWidth: '390px',
                    aspectRatio: '2 / 3',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
