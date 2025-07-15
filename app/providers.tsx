'use client';

import React, { useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai, mainnet, sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Create wagmi config with v2 syntax
const config = createConfig({
  chains: [polygonMumbai, polygon, sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
    safe(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '451f7ce63e391861923d8e3ace886fa9',
    }),
  ],
  transports: {
    [polygonMumbai.id]: http(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'U5Jt00V6iqGHtY-51fqxF'}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'U5Jt00V6iqGHtY-51fqxF'}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'U5Jt00V6iqGHtY-51fqxF'}`),
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'U5Jt00V6iqGHtY-51fqxF'}`),
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: '#3B82F6',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              })}
              showRecentTransactions={true}
            >
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Keep the old export for backward compatibility
export function Web3Provider({ children }: ProvidersProps) {
  return <Providers>{children}</Providers>;
}
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#0070f3',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          appInfo={{
            appName: 'AegisAI Governance Platform',
            disclaimer: ({ Text, Link }) => (
              <Text>
                By connecting your wallet, you agree to participate in the AegisAI decentralized governance ecosystem. 
                Your wallet will be used for identity verification, reputation tracking, and secure complaint submission to the blockchain.
                <br />
                <Link href="https://aegis-ai.com/privacy">Privacy Policy</Link> | 
                <Link href="https://aegis-ai.com/terms">Terms of Service</Link>
              </Text>
            ),
          }}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
