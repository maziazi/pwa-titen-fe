'use client'

import React, { useState, useEffect } from 'react'
import SwipeCard from './SwipeCard'
import { Card } from '@/app/page'

// 🟢 Blockchain Imports
import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions' // Untuk menunggu transaksi selesai
import { useConfig } from 'wagmi' // Config untuk actions
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { erc20Abi, maxUint256 } from 'viem' // Standard ERC20 ABI

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
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig() // Diperlukan untuk waitForTransactionReceipt

  // 1. Ambil Address Token IDRX dari Smart Contract
  const { data: idrxAddress } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'idrx',
  })

  // 2. Ambil Nominal Stake (misal 10 IDRX)
  const { data: fixedStake } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'fixedStake',
  })

  // 3. Cek Allowance (Izin) User ke Contract Market
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: idrxAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && idrxAddress ? [address, PREDICTION_MARKET_ADDRESS] : undefined,
    query: {
        enabled: !!address && !!idrxAddress
    }
  })

  // Helper: Cek Valid Market ID
  const isValidMarketId = (id: string) => {
    return !id.startsWith('upcoming-') && !id.startsWith('mock-');
  }

  // --- LOGIC UTAMA: APPROVE DULU, BARU STAKE ---
  const handleTrade = async (side: 1 | 2, nominal: number, card: Card) => {
    if (!isValidMarketId(card.id)) {
      alert("Market ini belum live di blockchain (Upcoming/Demo)")
      advanceCard()
      return
    }

    if (!idrxAddress || fixedStake === undefined || allowance === undefined) {
      console.error("Data blockchain belum siap")
      return
    }

    try {
      // LANGKAH A: Cek apakah butuh Approve?
      if (allowance < fixedStake) {
        console.log("⚠️ Allowance kurang. Meminta Approve dulu...")
        
        // 1. Kirim Transaksi Approve
        const approveHash = await writeContractAsync({
          address: idrxAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [PREDICTION_MARKET_ADDRESS, maxUint256], // Izin unlimited biar gak tanya terus
        })

        console.log("⏳ Menunggu Approve dikonfirmasi blockchain...", approveHash)
        
        // 2. Tunggu sampai Approve sukses di-mining
        await waitForTransactionReceipt(config, { hash: approveHash })
        
        console.log("✅ Approve Sukses! Lanjut Staking...")
        // Refresh data allowance
        await refetchAllowance()
      }

      // LANGKAH B: Lakukan Stake (Bayar IDRX)
      console.log(`🚀 Staking ${side === 1 ? 'YES' : 'NO'} on Market ID: ${card.id}`)
      
      const stakeHash = await writeContractAsync({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'stake',
        args: [BigInt(card.id), side], 
      })

      console.log("✅ Stake Terkirim:", stakeHash)

      // Update History Lokal
      if (onTransaction) {
        onTransaction({
          card: card,
          action: side === 1 ? 'YES' : 'NO',
          nominal,
          timestamp: new Date(),
        })
      }

    } catch (error) {
      console.error("❌ Transaksi Gagal:", error)
      alert("Transaksi Gagal/Dibatalkan. Pastikan kamu punya saldo IDRX testnet.")
    } finally {
      // Pindah kartu
      advanceCard()
    }
  }

  const handleSwipeRight = (nominal: number) => {
    handleTrade(1, nominal, cards[activeCardIndex]) // 1 = YES
  }

  const handleSwipeLeft = (nominal: number) => {
    handleTrade(2, nominal, cards[activeCardIndex]) // 2 = NO
  }

  const handleSwipeUp = () => {
    advanceCard()
  }

  const advanceCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % cards.length)
  }

  // --- RENDER (Sama seperti sebelumnya) ---
  const activeCard = cards[activeCardIndex]

  if (!activeCard) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        All caught up! No more markets.
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pb-24">
      <div className="relative w-full flex-1 flex items-center justify-center px-3">
        {cards.map((card, index) => {
           if (index < activeCardIndex || index > activeCardIndex + 2) return null;
           const offset = index - activeCardIndex;
           const zIndex = 50 - offset;
           const scale = 1 - (offset * 0.05);
           const translateY = offset * 15;
           const opacity = 1 - (offset * 0.2);

           return (
             <div 
                key={card.id + index}
                className="absolute transition-all duration-300"
                style={{
                  zIndex,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  opacity,
                  pointerEvents: offset === 0 ? 'auto' : 'none'
                }}
             >
                <SwipeCard 
                  card={card}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeUp={handleSwipeUp}
                  onDoubleTap={() => onCardDoubleTap(card)}
                />
             </div>
           )
        })}
      </div>
    </div>
  )
}