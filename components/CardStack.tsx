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
    const nextIndex = activeCardIndex + 1
    setActiveCardIndex(nextIndex)
    
    // Add more cards to stack when running low (infinite cycling)
    if (nextIndex > cardStack.length - 3) {
      setCardStack([...cardStack, ...cards])
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
    const nextIndex = activeCardIndex + 1
    setActiveCardIndex(nextIndex)
    
    // Add more cards to stack when running low (infinite cycling)
    if (nextIndex > cardStack.length - 3) {
      setCardStack([...cardStack, ...cards])
    }
  }

  const handleSwipeUp = () => {
    // SKIP action - swipe up
    const nextIndex = activeCardIndex + 1
    setActiveCardIndex(nextIndex)
    
    // Add more cards to stack when running low (infinite cycling)
    if (nextIndex > cardStack.length - 3) {
      setCardStack([...cardStack, ...cards])
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
              key={`${index}-${card.id}`}
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
                  className="rounded-3xl shadow-2xl relative p-6 flex flex-col justify-between overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F7E595 0%, #F0C155 100%)',
                    width: '90vw',
                    maxWidth: '390px',
                    aspectRatio: '2 / 3',
                  }}
                >
                  {/* Display transaction data on background cards */}
                  <div className="text-center z-10">
                    <p className="text-sm font-bold text-gray-700">{card.title}</p>
                  </div>
                  
                  {/* Show transaction status if this position has transaction data */}
                  {transactionHistory.length > 0 && index - 1 < transactionHistory.length && (
                    <div className="absolute inset-0 rounded-3xl bg-black bg-opacity-50 flex flex-col items-center justify-center z-20">
                      <div className="text-white text-center space-y-2">
                        <p className="text-sm font-bold">Last Approved</p>
                        <p className="text-xs">{transactionHistory[transactionHistory.length - 1].card.title}</p>
                        <p className={`text-lg font-bold ${transactionHistory[transactionHistory.length - 1].action === 'YES' ? 'text-green-400' : 'text-red-400'}`}>
                          {transactionHistory[transactionHistory.length - 1].action}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
