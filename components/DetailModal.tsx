'use client'

import React, { useEffect } from 'react'
import { Card } from '@/app/page'

interface DetailModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

export default function DetailModal({ card, isOpen, onClose }: DetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !card) return null

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full h-full bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Close Button */}
        <div className="sticky top-0 z-10 flex justify-end p-6 bg-gradient-to-b from-white to-transparent">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
          >
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-20">
          {/* Hero Image */}
          <div className="relative -mx-6 mb-8 overflow-hidden rounded-none bg-gradient-to-b from-gray-900 to-gray-800 aspect-video w-screen">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">🎯</div>
              </div>
            </div>
            
            {/* Status Badge */}
            {card.status && (
              <div className="absolute top-6 left-6 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {card.status}
              </div>
            )}
          </div>

          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{card.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{card.description}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                {card.category}
              </span>
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                {card.volume}
              </span>
            </div>
          </div>

          {/* Voting Distribution */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <p className="text-xs text-gray-600 font-medium mb-2">Voting NO</p>
              <p className="text-3xl font-bold text-red-600">{card.noPercentage}%</p>
              <div className="w-full bg-red-200 rounded-full h-2 mt-3">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${card.noPercentage}%` }}></div>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
              <p className="text-xs text-gray-600 font-medium mb-2">Voting YES</p>
              <p className="text-3xl font-bold text-green-600">{card.yesPercentage}%</p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${card.yesPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-8"></div>

          {/* Information Sections */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Market</h2>
              <p className="text-gray-700 leading-relaxed">
                {card.title} is a prediction market where you can stake your IDRX tokens on the outcome. 
                This market has a total trading volume of {card.volume} with {card.yesPercentage}% predicting YES and {card.noPercentage}% predicting NO.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Trade</h2>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Close this modal and swipe on the main card</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Swipe RIGHT for YES or LEFT for NO prediction</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>A colored card will appear with amount input</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>Adjust the amount and swipe again to confirm trade</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <p className="text-blue-900 font-semibold mb-2">Pro Tips:</p>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Swipe UP to skip to the next market</li>
                <li>• Markets close at different times - check the status</li>
                <li>• Your profit depends on final odds, not just winning</li>
              </ul>
            </div>
          </div>

          {/* Close Button at Bottom */}
          <div className="mt-10 mb-6">
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Back to Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
