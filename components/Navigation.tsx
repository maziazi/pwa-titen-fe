'use client'

import React from 'react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 border-t shadow-lg z-[100]"
      style={{ background: 'linear-gradient(135deg, #5799E9 0%, #95C5FF 100%)' }}
    >
      <div className="flex items-center justify-around h-20 max-w-md mx-auto w-full">
        {/* Markets Tab */}
        <button
          onClick={() => onTabChange('markets')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'markets' 
              ? 'text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M3 13h2v8H3V13zm4-8h2v16H7V5zm4-2h2v18h-2V3zm4 4h2v14h-2V7zm4-2h2v16h-2V5z"/>
          </svg>
          <span className="text-xs font-medium">Markets</span>
        </button>

        {/* Activity Tab */}
        <button
          onClick={() => onTabChange('activity')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
            activeTab === 'activity' 
              ? 'text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
          <span className="text-xs font-medium">Activity</span>
        </button>
      </div>
    </nav>
  )
}
