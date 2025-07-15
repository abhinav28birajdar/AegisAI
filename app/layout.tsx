import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Web3Provider as WagmiProvider } from "./providers"
import { Web3Provider as AegisWeb3Provider } from "@/lib/web3-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AegisAI - Decentralized AI-Powered Governance Platform",
  description:
    "Transform civic engagement through AI agents, blockchain transparency, CARV data ownership, and decentralized governance for smarter communities.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WagmiProvider>
            <AegisWeb3Provider>
              {children}
            </AegisWeb3Provider>
          </WagmiProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
