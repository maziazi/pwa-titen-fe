import React, { useState } from 'react'

interface Transaction {
  card: {
    id: string
    title: string
    symbol: string
    image?: string
    yesPercentage?: number
    noPercentage?: number
    volume?: string
    category?: string
    description?: string
  }
  action: 'YES' | 'NO' | 'SKIP'
  nominal: number
  timestamp: Date
}

interface ActivityPageProps {
  transactions: Transaction[]
  onCardClick: (card: any) => void
}

// Mock Data for Ends (History)
const mockEndedTransactions: Transaction[] = [
  {
    card: {
      id: 'ended-1',
      title: 'Will Bitcoin hit $100k in 2024?',
      symbol: 'BTC100K',
      image: '/btc_100k.png',
      yesPercentage: 85,
      noPercentage: 15,
      volume: '1.2B IDRX',
      category: 'Crypto',
      description: 'Bitcoin continues to surge as institutional adoption grows. Will it break the six-figure barrier before the end of the year?'
    },
    action: 'YES',
    nominal: 500000,
    timestamp: new Date('2023-12-01T10:00:00'),
  },
  {
    card: {
      id: 'ended-2',
      title: 'Real Madrid vs Barcelona',
      symbol: 'ELCLASICO',
      image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=400',
      yesPercentage: 40,
      noPercentage: 60,
      volume: '500M IDRX',
      category: 'Sports',
      description: 'El Clásico is here! Who will dominate the field in this legendary rivalry match?'
    },
    action: 'NO',
    nominal: 250000,
    timestamp: new Date('2023-11-25T15:30:00'),
  },
]

// Mock Data for Active (Live)
const mockActiveTransactions: Transaction[] = [
  {
    card: {
      id: 'active-1',
      title: 'Will Ethereum flip Bitcoin market cap in 2025?',
      symbol: 'ETHFLIP',
      image: '/eth_flip_btc.png',
      yesPercentage: 30,
      noPercentage: 70,
      volume: '800M IDRX',
      category: 'Crypto',
      description: 'The "Flippening" has been debated for years. Will 2025 be the year Ethereum finally surpasses Bitcoin in total value?'
    },
    action: 'YES',
    nominal: 100000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    card: {
      id: 'active-2',
      title: 'Indonesia Presidential Election 2029 Prediction',
      symbol: 'INDO29',
      image: '/indonesia_election.png',
      yesPercentage: 65,
      noPercentage: 35,
      volume: '2.5B IDRX',
      category: 'Politics',
      description: 'Early predictions for the next Indonesian presidential election. Who is leading the polls?'
    },
    action: 'NO',
    nominal: 50000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

export default function ActivityPage({ transactions, onCardClick }: ActivityPageProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'ends'>('active')

  // Combine real transactions (Active) + Mock Ended
  // In real app, you would filter based on card.status or similar
  // If no transactions, show mocks for demo
  const activeTransactions = transactions.length > 0 ? transactions : mockActiveTransactions
  const endedTransactions = mockEndedTransactions

  const renderCard = (t: Transaction, type: 'active' | 'ended') => (
    <div
      key={t.timestamp.toString() + t.card.id}
      onClick={() => onCardClick({
        ...t.card,
        status: type === 'active' ? 'Live' : 'Ended'
      })}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer active:scale-98"
    >
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
          {t.card.image ? (
            <img src={t.card.image} alt={t.card.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {t.action === 'YES' ? '🟢' : t.action === 'NO' ? '🔴' : '⚪️'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-tight">
            {t.card.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${t.action === 'YES' ? 'bg-green-100 text-green-700' :
              t.action === 'NO' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
              {t.action}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {type === 'active' ? 'Staked' : 'Result'}: <span className="text-gray-900">{t.nominal.toLocaleString()} IDRX</span>
            </span>
          </div>
        </div>

        {/* Status / Result */}
        <div className="flex flex-col items-end gap-1">
          {type === 'active' ? (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Live"></div>
          ) : (
            <span className="text-xs font-bold text-gray-400">ENDED</span>
          )}
        </div>
      </div>

      {/* Footer Stats for Ended */}
      {type === 'ended' && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
          <div className="flex gap-4">
            <span className="text-gray-500">Won? <span className="font-bold text-gray-900">Wait</span></span>
            <span className="text-gray-500">PnL: <span className="font-bold text-gray-900">-</span></span>
          </div>
          <span className="text-blue-500 font-semibold">View Result</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Custom Tab Switcher */}
      <div className="px-6 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex bg-gray-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Active Predictions
          </button>
          <button
            onClick={() => setActiveTab('ends')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'ends'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Ends / History
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3">
        {activeTab === 'active' ? (
          activeTransactions.length > 0 ? (
            activeTransactions.map(t => renderCard(t, 'active'))
          ) : (
            <EmptyState type="active" />
          )
        ) : (
          endedTransactions.length > 0 ? (
            endedTransactions.map(t => renderCard(t, 'ended'))
          ) : (
            <EmptyState type="ended" />
          )
        )}
      </div>
    </div>
  )
}

function EmptyState({ type }: { type: 'active' | 'ended' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-4 grayscale">
        {type === 'active' ? '⚡️' : '📜'}
      </div>
      <h3 className="text-gray-900 font-bold mb-1">
        {type === 'active' ? 'No Active Predictions' : 'No History Yet'}
      </h3>
      <p className="text-sm text-gray-500 max-w-[200px]">
        {type === 'active'
          ? 'Start swiping on markets to make your first prediction!'
          : 'Your finished predictions will appear here.'}
      </p>
    </div>
  )
}
