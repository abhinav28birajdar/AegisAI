"use client"

import Link from "next/link"
import { TwitterIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-blue-400">AegisAI</h3>
            <p className="text-sm text-slate-300">
              AI-Powered Civic Governance Platform
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/submit-complaint" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Submit Issue
            </Link>
            <Link 
              href="/profile" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-slate-300">Built by</span>
            <Link
              href="https://twitter.com/abhi28birajdar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <TwitterIcon className="h-4 w-4" />
              <span className="font-medium">Abhinav</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-sm text-slate-400">
            © 2025 AegisAI. All rights reserved. | Revolutionizing civic engagement through AI
          </p>
        </div>
      </div>
    </footer>
  )
}
