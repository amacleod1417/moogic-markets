'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

const flareCoston2 = defineChain({
  id: 114,
  name: 'Flare Coston2',
  network: 'flare-coston2',
  nativeCurrency: {
    name: 'Coston2 FLR',
    symbol: 'C2FLR',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
})

const config = createConfig({
    chains: [flareCoston2],
    transports: {
        [flareCoston2.id]: http()
    }
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
} 