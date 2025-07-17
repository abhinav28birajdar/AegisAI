'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoadingSpinner } from '@/components/ui/loading-fallback';

// Dynamically import Web3 providers to prevent SSR issues
const Web3Providers = dynamic(
  () => import('./web3-providers').then(mod => ({ default: mod.Web3Providers })),
  {
    ssr: false,
    loading: () => <PageLoadingSpinner />
  }
);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Web3Providers>
          {children}
        </Web3Providers>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Keep the old export for backward compatibility
export function Web3Provider({ children }: ProvidersProps) {
  return <Providers>{children}</Providers>;
}
