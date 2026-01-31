'use client'

import React, { useState } from 'react'
import SwipeCard from './SwipeCard'
import { Card } from '@/app/page'

// 🟢 Blockchain Imports
import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions' 
import { useConfig } from 'wagmi' 
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { erc20Abi, maxUint256, parseEther } from 'viem' // ✅ Tambah parseEther

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
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const config = useConfig() 

  // 1. Ambil Address Token
  const { data: idrxAddress } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'idrx',
  })

  // ❌ HAPUS: const { data: fixedStake } ... (Sudah tidak ada di contract)

  // 2. Cek Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: idrxAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && idrxAddress ? [address, PREDICTION_MARKET_ADDRESS] : undefined,
    query: { enabled: !!address && !!idrxAddress }
  })

  const isValidMarketId = (id: string) => {
    return !id.startsWith('upcoming-') && !id.startsWith('mock-');
  }

  // --- LOGIC TRANSAKSI DINAMIS ---
  const handleTrade = async (side: 1 | 2, nominal: number, card: Card) => {
    if (!isValidMarketId(card.id)) {
      alert("Market ini belum live di blockchain (Upcoming/Demo)")
      advanceCard()
      return
    }

    if (!idrxAddress) {
      console.error("Data blockchain belum siap")
      return
    }

    // ✅ CONVERT NOMINAL KE WEI (BigInt)
    // Asumsi nominal dari UI adalah string/number biasa (misal 100), kita ubah jadi 1000000...
    const stakeAmount = parseEther(nominal.toString());

    setIsProcessing(true)

    try {
      // ✅ CEK APPROVE DINAMIS
      // Bandingkan allowance dengan jumlah yang mau distake sekarang
      if (allowance === undefined || allowance < stakeAmount) {
        console.log(`⚠️ Meminta Approve untuk ${nominal} IDRX...`)
        const approveHash = await writeContractAsync({
          address: idrxAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [PREDICTION_MARKET_ADDRESS, maxUint256],
        })
        
        await waitForTransactionReceipt(config, { hash: approveHash })
        await refetchAllowance()
        console.log("✅ Approve Selesai")
      }

      // ✅ STAKE DENGAN AMOUNT
      console.log(`🚀 Staking ${nominal} IDRX ke Market ${card.id}...`)
      const stakeHash = await writeContractAsync({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'stake',
        // Kirim 3 argumen: ID, SIDE, AMOUNT
        args: [BigInt(card.id), side, stakeAmount], 
      })

      console.log("⏳ Menunggu konfirmasi jaringan...")
      await waitForTransactionReceipt(config, { hash: stakeHash })
      console.log("✅ Stake Terkonfirmasi!")

      if (onTransaction) {
        onTransaction({
          card: card,
          action: side === 1 ? 'YES' : 'NO',
          nominal: nominal, // Simpan angka asli buat history UI
          timestamp: new Date(),
        })
      }

    } catch (error) {
      console.error("❌ Transaksi Gagal:", error)
    } finally {
      setIsProcessing(false)
      advanceCard()
    }
  }

  const handleSwipeRight = (nominal: number) => {
    if (isProcessing) return;
    handleTrade(1, nominal, cards[activeCardIndex]) 
  }

  const handleSwipeLeft = (nominal: number) => {
    if (isProcessing) return;
    handleTrade(2, nominal, cards[activeCardIndex]) 
  }

  const handleSwipeUp = () => {
    if (isProcessing) return;
    advanceCard()
  }

  const advanceCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % cards.length)
  }

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
      {isProcessing && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
           <div className="bg-white px-6 py-4 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
              <span className="text-2xl">⏳</span>
              <p className="font-bold text-gray-800">Processing...</p>
           </div>
        </div>
      )}

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