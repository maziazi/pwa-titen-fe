'use client'

import React from 'react'

interface Transaction {
  card: {
    id: string
    title: string
    symbol: string
  }
  action: 'YES' | 'NO' | 'SKIP'
  nominal: number
  timestamp: Date
}

interface ActivityPageProps {
  transactions: Transaction[]
}

export default function ActivityPage({ transactions }: ActivityPageProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 px-4 pt-4 space-y-3">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <svg
            className="w-16 h-16 mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No activity yet</p>
          <p className="text-sm mt-1">Start trading to see your activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      transaction.action === 'YES'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : transaction.action === 'NO'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    }`}
                  >
                    {transaction.action === 'YES'
                      ? '✓'
                      : transaction.action === 'NO'
                        ? '✕'
                        : '⊃'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.card.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transaction.action === 'YES'
                        ? 'Predicted YES'
                        : transaction.action === 'NO'
                          ? 'Predicted NO'
                          : 'Skipped'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ${transaction.nominal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(transaction.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
