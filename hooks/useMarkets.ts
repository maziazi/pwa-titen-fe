import { useReadContracts } from 'wagmi';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts';
import { supabase, type Question } from '@/lib/supabase';
import { useEffect, useState, useMemo } from 'react';
import { formatUnits } from 'viem';

export interface Market {
  db_id: string;
  image: string;
  title: string;
  description: string;
  category: string;
  marketId: number | null;
  yesPool: string;
  noPool: string;
  volume: string;
  resolved: boolean;
  status: string;
  yesPercentage: number;
  noPercentage: number;
}

export function useMarkets() {
  const [hybridMarkets, setHybridMarkets] = useState<Market[]>([]);
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);

  // 1. Fetch Supabase
  useEffect(() => {
    async function fetchSupabase() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (data) {
        setDbQuestions(data);
      }
      if (error) console.error("Supabase Error:", error);
    }
    fetchSupabase();
  }, []); // Run sekali saat mount

  // 2. Filter & Memoize (PENTING: Gunakan useMemo untuk mencegah Infinite Loop)
  const marketsWithChainId = useMemo(() => {
    return dbQuestions.filter(q => 
      q.market_id !== null && 
      q.market_id !== undefined
    );
  }, [dbQuestions]); // Hanya update jika data DB berubah
  
  // 3. Read Contracts
  const { data: blockchainData, isLoading: isChainLoading } = useReadContracts({
    contracts: marketsWithChainId.map((q) => ({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'markets',
      // Safe guard: pastikan tidak null sebelum convert ke BigInt
      args: [BigInt(q.market_id || 0)], 
    })),
    query: {
      enabled: marketsWithChainId.length > 0,
      refetchInterval: 5000,
    }
  });

  // 4. Merge Data
  useEffect(() => {
    if (dbQuestions.length === 0) return;

    const merged = dbQuestions.map((dbItem) => {
      let yesPool = "0";
      let noPool = "0";
      let resolved = false;
      let status = "Upcoming"; 
      let volume = "0";
      
      // Cari index yang sesuai di array yang difilter
      const chainIndex = marketsWithChainId.findIndex(m => m.id === dbItem.id);
      
      // Ambil data hanya jika index ketemu dan hasilnya sukses
      const chainResult = chainIndex !== -1 ? blockchainData?.[chainIndex] : null;

      if (chainResult && chainResult.status === 'success' && chainResult.result) {
        const [question, endTime, yp, np, res, win] = chainResult.result as any;
        
        yesPool = yp.toString();
        noPool = np.toString();
        resolved = res;
        
        const now = Math.floor(Date.now() / 1000);
        const isEnded = Number(endTime) < now;

        if (resolved) status = "Selesai";
        else if (isEnded) status = "Menunggu Hasil";
        else status = "Live";
        
        const totalWei = BigInt(yesPool) + BigInt(noPool);
        volume = totalWei > 0n ? formatUnits(totalWei, 0) : "0"; 
      }

      // Hitung Persentase UI
      const yVal = Number(yesPool);
      const nVal = Number(noPool);
      const total = yVal + nVal;
      let yesPct = 50;
      let noPct = 50;
      
      if (total > 0) {
        yesPct = Math.round((yVal / total) * 100);
        noPct = 100 - yesPct;
      } else {
        if (dbItem.yes_percentage) yesPct = dbItem.yes_percentage;
        if (dbItem.no_percentage) noPct = dbItem.no_percentage;
      }

      return {
        db_id: dbItem.id,
        marketId: dbItem.market_id, 
        title: dbItem.title,
        description: dbItem.description || dbItem.title,
        image: dbItem.photo_url || 'https://placehold.co/600x400/png?text=No+Image',
        category: dbItem.category || 'General',
        yesPool,
        noPool,
        resolved,
        status,
        volume,
        yesPercentage: yesPct,
        noPercentage: noPct
      };
    });

    setHybridMarkets(merged);
  }, [dbQuestions, blockchainData, marketsWithChainId]); // Dependencies aman karena marketsWithChainId sudah di-memoize

  return { markets: hybridMarkets, isLoading: dbQuestions.length === 0 && isChainLoading };
}