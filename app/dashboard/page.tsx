// Enhanced Citizen Dashboard for CivicChain
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCarvAuth } from '@/lib/carv-sdk'
import { 
  Plus, 
  FileText, 
  Vote, 
  Users, 
  TrendingUp, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Coins,
  Trophy,
  Calendar,
  MessageSquare,
  BarChart3,
  Zap,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react'

// Mock data - in real app this would come from API
const mockUserData = {
  name: 'Alex Johnson',
  carvId: 'carv_abc123def456',
  walletAddress: '0x742d35Cc6639C0532fEb303a5A6FAe9EC33A8E73',
  civicTokens: 1247.85,
  reputationScore: 842,
  reputationTier: 'Gold',
  totalComplaints: 12,
  resolvedComplaints: 9,
  daoVotes: 8,
  volunteerHours: 24.5,
  nftBadges: ['Community Hero', 'Early Adopter', 'Active Voter']
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'complaint',
    title: 'Pothole on Main Street',
    status: 'in_progress',
    date: '2025-07-10',
    priority: 'high'
  },
  {
    id: '2',
    type: 'dao_vote',
    title: 'Community Park Renovation',
    status: 'voted',
    date: '2025-07-08',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Beach Cleanup Initiative',
    status: 'completed',
    date: '2025-07-05',
    priority: 'low'
  }
]

const mockActiveProposals = [
  {
    id: '1',
    title: 'Install Solar Panels on Municipal Buildings',
    votingDeadline: '2025-07-25',
    currentVotes: 1247,
    requiredVotes: 2000,
    support: 78,
    status: 'active'
  },
  {
    id: '2',
    title: 'Expand Bicycle Lane Network',
    votingDeadline: '2025-07-30',
    currentVotes: 856,
    requiredVotes: 1500,
    support: 65,
    status: 'active'
  }
]

export default function DashboardPage() {
  const { profile, isAuthenticated, loading } = useCarvAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'voted':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <span className="text-xl font-bold">CivicChain</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
              <Link href="/complaints" className="text-gray-600 hover:text-gray-900">My Issues</Link>
              <Link href="/dao" className="text-gray-600 hover:text-gray-900">DAO</Link>
              <Link href="/community" className="text-gray-600 hover:text-gray-900">Community</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.png" />
                <AvatarFallback>{mockUserData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {mockUserData.name}! 👋
          </h1>
          <p className="text-gray-600">
            Welcome back to your civic engagement dashboard. Here's what's happening in your community.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CIVIC Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUserData.civicTokens.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  +125 this week
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reputation</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUserData.reputationScore}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge className="text-xs bg-purple-100 text-purple-800">
                  {mockUserData.reputationTier} Tier
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Issues Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockUserData.resolvedComplaints}/{mockUserData.totalComplaints}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(mockUserData.resolvedComplaints / mockUserData.totalComplaints) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">DAO Votes</p>
                  <p className="text-2xl font-bold text-gray-900">{mockUserData.daoVotes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  85% participation
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Take action in your community with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                <Link href="/submit-complaint">
                  <Plus className="w-6 h-6" />
                  <span>Report Issue</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                <Link href="/dao">
                  <Vote className="w-6 h-6" />
                  <span>Vote on Proposals</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                <Link href="/community/events">
                  <Calendar className="w-6 h-6" />
                  <span>Join Events</span>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                <Link href="/community/volunteering">
                  <Users className="w-6 h-6" />
                  <span>Volunteer</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Active Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className={`p-4 border-l-4 bg-gray-50 ${getPriorityColor(activity.priority)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{activity.type.replace('_', ' ')}</p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{activity.date}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active DAO Proposals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Vote className="w-5 h-5 mr-2" />
                Active Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActiveProposals.map((proposal) => (
                  <div key={proposal.id} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{proposal.title}</h4>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Votes: {proposal.currentVotes}/{proposal.requiredVotes}</span>
                      <span>Support: {proposal.support}%</span>
                    </div>
                    <Progress value={(proposal.currentVotes / proposal.requiredVotes) * 100} className="h-2 mb-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Ends: {proposal.votingDeadline}</span>
                      <Button size="sm" asChild>
                        <Link href={`/dao/proposals/${proposal.id}`}>Vote</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dao">View All Proposals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Widget */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
