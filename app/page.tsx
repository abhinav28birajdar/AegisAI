// Enhanced Landing Page for CivicChain
'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCarvAuth } from '@/lib/carv-sdk'
import { 
  Shield, 
  Brain, 
  Vote, 
  Coins, 
  Users, 
  MapPin, 
  TrendingUp, 
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Lock,
  BarChart3,
  MessageSquare
} from 'lucide-react'

const stats = [
  { label: 'Active Citizens', value: '15,847', change: '+12%' },
  { label: 'Issues Resolved', value: '8,234', change: '+23%' },
  { label: 'CIVIC Tokens Earned', value: '2.4M', change: '+18%' },
  { label: 'DAO Proposals', value: '156', change: '+8%' }
]

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Classification',
    description: 'Gemini AI instantly categorizes and prioritizes your reports for faster resolution',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Shield,
    title: 'CARV Self-Sovereign Identity',
    description: 'Your identity, your data, your control. Verified credentials with privacy by design',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Vote,
    title: 'Decentralized Governance',
    description: 'Participate in city decisions through blockchain-secured DAO voting',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Coins,
    title: 'Civic Token Rewards',
    description: 'Earn $CIVIC tokens for contributing to your community and participating in governance',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: MapPin,
    title: 'Location Intelligence',
    description: 'GPS-precise reporting with AI-powered area analytics and predictive insights',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'AI forecasts infrastructure needs and optimizes resource allocation',
    color: 'bg-indigo-100 text-indigo-600'
  }
]

export default function Home() {
  const { isAuthenticated, login, loading } = useCarvAuth()

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard'
    } else {
      await login()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CivicChain
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="#community" className="text-gray-600 hover:text-gray-900 transition-colors">
                Community
              </Link>
              <Button variant="secondary" size="sm">
                <Link href="/auth/signin" className="w-full h-full block">Sign In</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              Powered by AI × Web3 × CARV
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your City with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intelligent Governance
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the revolution in civic engagement. Report issues, participate in governance, 
              and build smarter cities with AI-powered insights, blockchain transparency, 
              and self-sovereign identity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? 'Connecting...' : isAuthenticated ? 'Go to Dashboard' : 'Sign in with CARV ID'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of civic engagement with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How CivicChain Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and transparent civic engagement in four steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Connect with CARV ID',
                description: 'Secure authentication with self-sovereign identity',
                icon: Lock
              },
              {
                step: '02',
                title: 'Report & Participate',
                description: 'Submit issues, vote on proposals, join discussions',
                icon: MessageSquare
              },
              {
                step: '03',
                title: 'AI Analysis',
                description: 'Gemini AI classifies, prioritizes, and provides insights',
                icon: Brain
              },
              {
                step: '04',
                title: 'Transparent Resolution',
                description: 'Track progress on blockchain, earn rewards',
                icon: CheckCircle
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="absolute top-8 left-8 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens building smarter, more responsive communities
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              {loading ? 'Connecting...' : 'Get Started Now'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CivicChain</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering citizens and transforming governance through AI, Web3, and self-sovereign identity.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Powered by CARV
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Gemini AI
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  Polygon
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/dao" className="hover:text-white transition-colors">DAO Governance</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">Developer API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CivicChain. Built for a transparent, participatory future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
