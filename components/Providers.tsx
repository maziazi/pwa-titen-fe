'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia } from 'viem/chains'; // Ganti ke 'base' nanti kalau mau live production
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // 1. Setup Wagmi Config (Koneksi Wallet)
  const [config] = useState(() =>
    createConfig({
      chains: [baseSepolia],
      transports: {
        [baseSepolia.id]: http(),
      },
      connectors: [
        coinbaseWallet({
          appName: 'TITEN',
          preference: 'smartWalletOnly', // INI KUNCINYA: Paksa mode Smart Wallet (Passkey)
        }),
      ],
    })
  );

  // 2. Setup React Query (Untuk caching data blockchain)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY} // Nanti kita set ini di .env
          chain={baseSepolia}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}