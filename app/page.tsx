'use client'

import React, { useState, useEffect } from 'react'
import CardStack from '@/components/CardStack'
import Navigation from '@/components/Navigation'
import DetailModal from '@/components/DetailModal'
import ActivityPage from '@/components/ActivityPage'
import SubmitQuestionModal from '@/components/SubmitQuestionModal'
import Toast from '@/components/Toast'
import type { QuestionSubmission } from '@/components/SubmitQuestionModal'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useMarkets } from '@/hooks/useMarkets'
import { coinbaseWallet } from 'wagmi/connectors'

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
    id: 'mock-1',
    title: 'Loading Markets...',
    symbol: 'WAIT',
    description: 'Fetching latest data from Base...',
    status: 'Loading',
    isNew: false,
    yesPercentage: 50,
    noPercentage: 50,
    volume: '0',
    category: 'System',
  }
]

export default function Home() {
  // Fix Hydration: State untuk cek apakah sudah di client
  const [isMounted, setIsMounted] = useState(false);

  const [currentTab, setCurrentTab] = useState('markets')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [cards, setCards] = useState<Card[]>([]) 
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>(
    { message: '', type: 'success', isVisible: false }
  )

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { data: balanceData } = useBalance({ address })
  const { markets: realMarkets, isLoading } = useMarkets()

  // 1. Set Mounted true setelah render pertama di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Update Cards saat data masuk
  useEffect(() => {
    if (realMarkets.length > 0) {
      const formattedCards: Card[] = realMarkets.map((m) => {
        const cardId = m.marketId !== null ? m.marketId.toString() : `upcoming-${m.db_id}`
        return {
          id: cardId,
          title: m.title,
          symbol: m.category ? m.category.substring(0, 8).toUpperCase() : 'GENERAL',
          description: m.description,
          image: m.image,
          status: m.status,
          isNew: m.status === 'Live',
          yesPercentage: m.yesPercentage,
          noPercentage: m.noPercentage,
          volume: `${m.volume} IDRX`,
          category: m.category,
        }
      })
      setCards(formattedCards)
    } else if (!isLoading && realMarkets.length === 0) {
      // Jika loading selesai tapi tidak ada data, kosongkan atau pakai mock
      setCards([]) 
    }
  }, [realMarkets, isLoading])

  const handleLogin = () => {
    connect({ connector: coinbaseWallet({ appName: 'TITEN' }) })
  }

  const handleAddTransaction = (transaction: any) => {
    setTransactionHistory([transaction, ...transactionHistory])
  }

  const handleSubmitQuestion = async (data: QuestionSubmission) => {
      console.log("Submitting:", data);
      setShowSubmitModal(false);
      setToast({ message: 'Question submitted! Waiting for approval.', type: 'success', isVisible: true });
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '...'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Prevent Hydration Mismatch: Jangan render konten berat sebelum mounted
  if (!isMounted) return null;

  return (
    <div className="flex flex-col w-screen h-screen" style={{ backgroundColor: '#FCF9E1' }}>
      {/* HEADER */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-yellow-200">
        
        {/* Left: Account Section */}
        {isConnected ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-2xl font-bold shadow-md">
              💰
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-900">
                {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ETH` : 'Loading...'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">
                  {formatAddress(address)}
                </span>
                <button 
                  onClick={() => disconnect()} 
                  className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  title="Disconnect"
                >
                  <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                   <polyline points="16 17 21 12 16 7"></polyline>
                   <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
          >
            <span>⚡ Connect Wallet</span>
          </button>
        )}

        {/* Right: Add Question Button */}
        {currentTab === 'markets' && isConnected && (
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

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'markets' && (
          isLoading && cards.length === 0 ? (
            <div className="flex items-center justify-center h-full flex-col gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <div className="text-gray-600 font-medium animate-pulse">Loading markets...</div>
            </div>
          ) : (
            <CardStack 
              cards={cards.length > 0 ? cards : mockCards} 
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

      {/* MODALS & NAVIGATION */}
      <DetailModal 
        card={selectedCard}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      <SubmitQuestionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitQuestion}
      />

      <Navigation 
        activeTab={currentTab} 
        onTabChange={setCurrentTab}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}