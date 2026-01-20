'use client'

import React, { useState, useEffect } from 'react'
import CardStack from '@/components/CardStack'
import Navigation from '@/components/Navigation'
import DetailModal from '@/components/DetailModal'
import ActivityPage from '@/components/ActivityPage'
import SubmitQuestionModal from '@/components/SubmitQuestionModal'
import Toast from '@/components/Toast'
import type { QuestionSubmission } from '@/components/SubmitQuestionModal'

export interface Card {
  id: string
  title: string
  symbol: string
  description?: string
  image?: string
  status?: string
  isNew?: boolean
  yesPercentage?: number
  noPercentage?: number
  volume?: string
  category?: string
}

const mockCards: Card[] = [
  {
    id: '1',
    title: 'Real Madrid vs Barcelona',
    symbol: 'FOOTBALL',
    description: 'Will Real Madrid win the El Clásico?',
    status: 'Open • Ends in 3d',
    isNew: true,
    yesPercentage: 32,
    noPercentage: 68,
    volume: '$1.2m',
    category: 'Sports - Football - LaLiga',
  },
  {
    id: '2',
    title: 'Will BTC reach $100k?',
    symbol: 'BTC',
    description: 'Bitcoin price prediction by end of month',
    status: 'Open • Ends in 12h',
    isNew: false,
    yesPercentage: 45,
    noPercentage: 55,
    volume: '$2.8m',
    category: 'Crypto - Bitcoin - Price',
  },
  {
    id: '3',
    title: 'Trump 2024 Election',
    symbol: 'POLITICS',
    description: 'Will Trump win the 2024 election?',
    status: 'Open • Ends in 45m',
    isNew: true,
    yesPercentage: 52,
    noPercentage: 48,
    volume: '$5.5m',
    category: 'Politics - Election - USA',
  },
  {
    id: '4',
    title: 'Apple Q4 Earnings Beat',
    symbol: 'AAPL',
    description: 'Will Apple beat earnings expectations?',
    status: 'Closed • Resolving',
    isNew: false,
    yesPercentage: 38,
    noPercentage: 62,
    volume: '$3.2m',
    category: 'Tech - Stocks - Apple',
  },
  {
    id: '5',
    title: 'Tesla Stock Above $300',
    symbol: 'TSLA',
    description: 'Will Tesla stock reach $300 by Q2?',
    status: 'Resolved • YES',
    isNew: false,
    yesPercentage: 75,
    noPercentage: 25,
    volume: '$1.8m',
    category: 'Tech - Stocks - Tesla',
  },
  {
    id: '6',
    title: 'Will AI Reach AGI in 2025?',
    symbol: 'AI',
    description: 'Artificial General Intelligence achievable this year?',
    status: 'Open • Ends in 8d',
    isNew: true,
    yesPercentage: 28,
    noPercentage: 72,
    volume: '$4.1m',
    category: 'Tech - AI - AGI',
  },
  {
    id: '7',
    title: 'S&P 500 New All-Time High',
    symbol: 'SPX',
    description: 'Will S&P 500 hit new all-time high this month?',
    status: 'Open • Ends in 7d',
    isNew: false,
    yesPercentage: 61,
    noPercentage: 39,
    volume: '$2.3m',
    category: 'Finance - Stocks - Index',
  },
  {
    id: '8',
    title: 'Ethereum Flips Bitcoin',
    symbol: 'ETH',
    description: 'Will Ethereum market cap exceed Bitcoin?',
    status: 'Open • Ends in 15d',
    isNew: false,
    yesPercentage: 19,
    noPercentage: 81,
    volume: '$1.5m',
    category: 'Crypto - Ethereum - Market',
  },
  {
    id: '9',
    title: 'Next iPhone Has No Ports',
    symbol: 'AAPL',
    description: 'Will the next iPhone be completely wireless?',
    status: 'Open • Ends in 5d',
    isNew: true,
    yesPercentage: 42,
    noPercentage: 58,
    volume: '$890k',
    category: 'Tech - Apple - iPhone',
  },
  {
    id: '10',
    title: 'World Cup 2026 Winner',
    symbol: 'SPORTS',
    description: 'Will Argentina win the 2026 World Cup?',
    status: 'Open • Ends in 120d',
    isNew: false,
    yesPercentage: 18,
    noPercentage: 82,
    volume: '$6.7m',
    category: 'Sports - Football - World Cup',
  },
]

export default function Home() {
  const [currentTab, setCurrentTab] = useState('markets')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [cards, setCards] = useState<Card[]>(mockCards)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>(
    { message: '', type: 'success', isVisible: false }
  )

  // Fetch approved questions from database
  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/questions')
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        setCards(result.data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      // Keep using mock data if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = (transaction: any) => {
    setTransactionHistory([transaction, ...transactionHistory])
  }

  const handleSubmitQuestion = async (data: QuestionSubmission) => {
    try {
      const formData = new FormData()
      formData.append('title', data.question)
      formData.append('description', data.question)
      formData.append('endDate', data.endDate)
      formData.append('endTime', data.endTime)
      formData.append('category', data.categories[0] || 'General')
      if (data.photo) {
        formData.append('photo', data.photo)
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        console.log('Question submitted successfully:', result)
        setToast({
          message: 'Question submitted! Waiting for admin approval.',
          type: 'success',
          isVisible: true
        })
        setShowSubmitModal(false)
        // Optionally refresh the questions list
        fetchQuestions()
      } else {
        console.error('Error submitting question:', result.error)
        setToast({
          message: 'Failed to submit question. Please try again.',
          type: 'error',
          isVisible: true
        })
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      setToast({
        message: 'Failed to submit question. Please try again.',
        type: 'error',
        isVisible: true
      })
    }
  }

  const setShowModal = (value: boolean) => {
    setShowDetailModal(value)
  }

  const showModal = showDetailModal

  return (
    <div className="flex flex-col w-screen h-screen" style={{ backgroundColor: '#FCF9E1' }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-yellow-200">
        {/* Left: Account Section */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-2xl font-bold shadow-md">
            💰
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-gray-900">10 IDRX</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">0x2334....3222</span>
              <button 
                className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Copy address"
              >
                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Right: Add Question Button */}
        {currentTab === 'markets' && (
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg hover:shadow-xl transition-shadow active:scale-95"
            style={{ background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}
            title="Add new question"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'markets' && (
          loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-600 font-medium">Loading questions...</div>
            </div>
          ) : (
            <CardStack 
              cards={cards} 
              onCardDoubleTap={(card) => {
                setSelectedCard(card)
                setShowDetailModal(true)
              }}
              onTransaction={handleAddTransaction}
            />
          )
        )}
        {currentTab === 'activity' && (
          <ActivityPage transactions={transactionHistory} />
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal 
        card={selectedCard}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Submit Question Modal */}
      <SubmitQuestionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitQuestion}
      />

      <Navigation 
        activeTab={currentTab} 
        onTabChange={setCurrentTab}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
