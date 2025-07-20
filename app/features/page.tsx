'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { 
  Shield, 
  MessageSquare, 
  FileText, 
  Users,
  Award,
  TrendingUp,
  Heart,
  Gavel,
  Bell,
  Search,
  Lock,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  status: 'available' | 'coming-soon' | 'beta'
  category: 'governance' | 'community' | 'transparency' | 'security'
  icon: React.ReactNode
  href?: string
  comingSoon?: boolean
}

export default function FeaturesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [mounted, authLoading, user, router])

  const features: Feature[] = [
    {
      id: 'complaints',
      title: 'Civic Complaints',
      description: 'Submit and track civic issues in your community with transparency and accountability.',
      status: 'available',
      category: 'transparency',
      icon: <FileText className="w-6 h-6" />,
      href: '/submit-complaint'
    },
    {
      id: 'dashboard',
      title: 'Personal Dashboard',
      description: 'Monitor your civic activities, complaint status, and community engagement metrics.',
      status: 'available',
      category: 'transparency',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/dashboard'
    },
    {
      id: 'dao-governance',
      title: 'DAO Governance',
      description: 'Participate in decentralized decision-making through proposal voting and community governance.',
      status: 'available',
      category: 'governance',
      icon: <Gavel className="w-6 h-6" />,
      href: '/dao/proposals'
    },
    {
      id: 'community-hub',
      title: 'Community Hub',
      description: 'Connect with fellow citizens, join events, and collaborate on civic initiatives.',
      status: 'available',
      category: 'community',
      icon: <Users className="w-6 h-6" />,
      href: '/community'
    },
    {
      id: 'volunteer',
      title: 'Volunteer Network',
      description: 'Find volunteer opportunities and contribute your skills to community projects.',
      status: 'available',
      category: 'community',
      icon: <Heart className="w-6 h-6" />,
      href: '/volunteer'
    },
    {
      id: 'reputation-system',
      title: 'Reputation System',
      description: 'Earn credibility through verified civic contributions and community engagement.',
      status: 'beta',
      category: 'security',
      icon: <Award className="w-6 h-6" />,
      href: '/profile'
    },
    {
      id: 'smart-notifications',
      title: 'Smart Notifications',
      description: 'Stay informed about complaint updates, community events, and governance decisions.',
      status: 'available',
      category: 'transparency',
      icon: <Bell className="w-6 h-6" />,
      href: '/notifications'
    },
    {
      id: 'advanced-search',
      title: 'Advanced Search',
      description: 'Find complaints, proposals, and community content with powerful search and filtering.',
      status: 'coming-soon',
      category: 'transparency',
      icon: <Search className="w-6 h-6" />,
      comingSoon: true
    },
    {
      id: 'blockchain-verification',
      title: 'Blockchain Verification',
      description: 'Immutable record-keeping and verification of all civic activities and transactions.',
      status: 'beta',
      category: 'security',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'ai-categorization',
      title: 'AI-Powered Categorization',
      description: 'Automatic complaint categorization and routing using advanced AI algorithms.',
      status: 'beta',
      category: 'transparency',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'privacy-controls',
      title: 'Privacy Controls',
      description: 'Advanced privacy settings and anonymous complaint submission options.',
      status: 'available',
      category: 'security',
      icon: <Lock className="w-6 h-6" />,
      href: '/settings'
    },
    {
      id: 'public-api',
      title: 'Public API',
      description: 'Open API for developers to build applications on top of the CivicChain platform.',
      status: 'coming-soon',
      category: 'transparency',
      icon: <Globe className="w-6 h-6" />,
      comingSoon: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'beta':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'coming-soon':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance':
        return 'bg-blue-50 border-blue-200'
      case 'community':
        return 'bg-purple-50 border-purple-200'
      case 'transparency':
        return 'bg-green-50 border-green-200'
      case 'security':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'governance':
        return <Gavel className="w-5 h-5 text-blue-600" />
      case 'community':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'transparency':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'security':
        return <Shield className="w-5 h-5 text-orange-600" />
      default:
        return <Globe className="w-5 h-5 text-gray-600" />
    }
  }

  const categories = [
    { 
      id: 'governance', 
      name: 'Governance', 
      description: 'Democratic decision-making tools',
      count: features.filter(f => f.category === 'governance').length
    },
    { 
      id: 'community', 
      name: 'Community', 
      description: 'Connection and collaboration features',
      count: features.filter(f => f.category === 'community').length
    },
    { 
      id: 'transparency', 
      name: 'Transparency', 
      description: 'Open and accountable civic processes',
      count: features.filter(f => f.category === 'transparency').length
    },
    { 
      id: 'security', 
      name: 'Security', 
      description: 'Privacy and verification systems',
      count: features.filter(f => f.category === 'security').length
    }
  ]

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading features...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Platform Features</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the tools and capabilities that make CivicChain the most comprehensive 
            platform for civic engagement and community governance.
          </p>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className={`${getCategoryColor(category.id)} border-2`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  {getCategoryIcon(category.id)}
                  <Badge className="bg-white/80 text-gray-700">
                    {category.count} features
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className={`${getCategoryColor(feature.category)} transition-all duration-200 ${
                feature.href && !feature.comingSoon 
                  ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                  : feature.comingSoon 
                    ? 'opacity-75' 
                    : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-white/80 rounded-lg">
                    {feature.icon}
                  </div>
                  <Badge className={`${getStatusColor(feature.status)} border`}>
                    {feature.status === 'coming-soon' ? 'Coming Soon' : 
                     feature.status === 'beta' ? 'Beta' : 'Available'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(feature.category)}
                    <span className="text-sm font-medium capitalize">
                      {feature.category}
                    </span>
                  </div>
                  {feature.href && !feature.comingSoon ? (
                    <Link href={feature.href}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : feature.status === 'available' ? (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Development Roadmap
            </CardTitle>
            <CardDescription>Upcoming features and improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900">Phase 1: Core Platform</h4>
                  <p className="text-green-700 text-sm">
                    Basic complaint management, user authentication, and community features - <span className="font-medium">Completed</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Phase 2: Advanced Features</h4>
                  <p className="text-blue-700 text-sm">
                    DAO governance, reputation system, and blockchain integration - <span className="font-medium">In Progress</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 3: AI & Analytics</h4>
                  <p className="text-gray-700 text-sm">
                    Advanced search, AI categorization, and comprehensive analytics - <span className="font-medium">Coming Q2 2024</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
