'use client'

import React, { useState, useEffect } from 'react'
import CardStack from '@/components/CardStack'
import Navigation from '@/components/Navigation'
import DetailModal from '@/components/DetailModal'
import ActivityPage from '@/components/ActivityPage'
import SubmitQuestionModal from '@/components/SubmitQuestionModal'
import Toast from '@/components/Toast'
import type { QuestionSubmission } from '@/components/SubmitQuestionModal'
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract } from 'wagmi'
import { useMarkets } from '@/hooks/useMarkets'
import { coinbaseWallet } from 'wagmi/connectors'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'

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
  const [isMounted, setIsMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState('markets')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [cards, setCards] = useState<Card[]>([])

  // State Toast untuk notifikasi sukses
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>(
    { message: '', type: 'success', isVisible: false }
  )

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const { markets: realMarkets, isLoading } = useMarkets()

  // 1. Ambil Address Token IDRX
  const { data: idrxAddress } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'idrx',
  })

  // 2. Ambil Saldo IDRX User
  const { data: idrxBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: idrxAddress as `0x${string}`,
    query: {
      enabled: !!address && !!idrxAddress,
    }
  })

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      setCards([])
    }
  }, [realMarkets, isLoading])

  const handleLogin = () => {
    connect({ connector: coinbaseWallet({ appName: 'TITEN' }) })
  }

  // 🟢 FUNGSI PENTING: Dipanggil saat CardStack selesai transaksi
  const handleTransactionSuccess = async (transaction: any) => {
    // 1. Simpan history
    setTransactionHistory([transaction, ...transactionHistory])

    // 2. Refresh saldo IDRX (Penting agar saldo berkurang di UI)
    await refetchBalance()

    // 3. Tampilkan Notifikasi Sukses
    setToast({
      message: `Berhasil Stake ${transaction.action} pada ${transaction.card.title}!`,
      type: 'success',
      isVisible: true
    })
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

  if (!isMounted) return null;

  return (
    <div className="flex flex-col w-screen h-screen" style={{ backgroundColor: '#FCF9E1' }}>
      {/* HEADER */}

      <div className="px-6 py-5 flex items-center justify-between border-b border-yellow-200">

        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <img src="/Logo-Titen.png" alt="Titen Logo" className="w-10 h-10 object-contain" />
          <h1 className="font-bold text-lg text-gray-800 leading-tight">
            Titen <br /> <span className="text-sm font-normal text-gray-500">Predictions market</span>
          </h1>
        </div>

        {/* Right: Account Section & Add Button */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              {/* Saldo Simple */}
              <div className="flex flex-col items-end mr-1">
                <span className="font-bold text-sm text-gray-900">
                  {idrxBalance ? `${parseFloat(idrxBalance.formatted).toFixed(2)}` : '...'}
                </span>
                <span className="text-xs text-gray-500">IDRX</span>
              </div>

              {/* Avatar / Initial */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-lg font-bold shadow-md">
                💰
              </div>

              {/* Disconnect Tiny Button */}
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
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <span>Connect</span>
            </button>
          )}

          {/* Add Question Button */}
          {currentTab === 'markets' && isConnected && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}
              title="Add new question"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
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
              // Sambungkan ke fungsi sukses tadi
              onTransaction={handleTransactionSuccess}
            />
          )
        )}
        {currentTab === 'activity' && (
          <ActivityPage transactions={transactionHistory} />
        )}
      </div>

      {/* MODALS */}
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

      {/* Toast Notifikasi */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}