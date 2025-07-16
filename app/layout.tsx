import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

// Using system fonts to avoid Google Fonts connectivity issues
const systemFont = {
  style: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }
}

export const metadata: Metadata = {
  title: "AegisAI - AI-Powered Civic Governance Platform",
  description:
    "Revolutionary civic engagement through AI intelligence, blockchain transparency, and CARV Protocol data sovereignty for smarter communities.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning style={systemFont.style}>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
