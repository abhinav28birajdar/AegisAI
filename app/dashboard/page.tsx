'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  HelpCircle,
  Shield,
  Globe,
  Activity,
  Eye
} from 'lucide-react'

interface DashboardStats {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  daoProposals: number
  activeVotes: number
  communityEvents: number
  reputationScore: number
  civicTokens: number
}

interface RecentActivity {
  id: string
  type: 'complaint' | 'vote' | 'event' | 'proposal' | 'reward'
  title: string
  time: string
  status: 'pending' | 'completed' | 'active'
}

interface DAOProposal {
  id: string
  title: string
  voting_end_date: string
  current_votes: number
  required_votes: number
  support_threshold: number
  status: 'active' | 'passed' | 'failed'
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [activeProposals, setActiveProposals] = useState<DAOProposal[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push('/auth/signin')
      } else {
        fetchDashboardData()
      }
    }
  }, [mounted, authLoading, user, router])

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist, create profile
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            reputation_score: 100,
            civic_tokens: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
        } else {
          profile = newProfile
        }
      }

      setUserProfile(profile)

      // Fetch dashboard statistics
      const [
        { count: totalComplaints },
        { count: resolvedComplaints },
        { count: daoProposals },
        { count: activeVotes },
        { count: communityEvents }
      ] = await Promise.all([
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'resolved'),
        supabase.from('dao_proposals').select('*', { count: 'exact', head: true }),
        supabase.from('dao_votes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('community_events').select('*', { count: 'exact', head: true })
      ])

      const dashboardStats: DashboardStats = {
        totalComplaints: totalComplaints || 0,
        resolvedComplaints: resolvedComplaints || 0,
        pendingComplaints: (totalComplaints || 0) - (resolvedComplaints || 0),
        daoProposals: daoProposals || 0,
        activeVotes: activeVotes || 0,
        communityEvents: communityEvents || 0,
        reputationScore: profile?.reputation_score || 100,
        civicTokens: profile?.civic_tokens || 0
      }

      setStats(dashboardStats)

      // Fetch active proposals
      const { data: proposals } = await supabase
        .from('dao_proposals')
        .select('*')
        .eq('status', 'active')
        .limit(3)
        .order('created_at', { ascending: false })

      setActiveProposals(proposals || [])

      // Fetch recent activity (simplified for now)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'vote',
          title: 'Voted on infrastructure proposal',
          time: '2 hours ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'complaint',
          title: 'Submitted new complaint',
          time: '1 day ago',
          status: 'pending'
        }
      ]

      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <FileText className="w-4 h-4 text-orange-500" />
      case 'vote':
        return <Vote className="w-4 h-4 text-blue-500" />
      case 'event':
        return <Calendar className="w-4 h-4 text-green-500" />
      case 'proposal':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case 'reward':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Show loading while mounting or authenticating
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link href="/notifications">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/submit-complaint">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Submit</p>
                    <p className="text-lg font-semibold">New Complaint</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Plus className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dao/proposals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vote on</p>
                    <p className="text-lg font-semibold">DAO Proposals</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Vote className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community/events">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Join</p>
                    <p className="text-lg font-semibold">Community Events</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community</p>
                    <p className="text-lg font-semibold">Chat & Discuss</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reputation Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.reputationScore || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Citizen Level</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Civic Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.civicTokens || 0}</p>
                  <p className="text-sm text-green-600 mt-1">+0 this month</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">DAO Votes Cast</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeVotes || 0}</p>
                  <p className="text-sm text-blue-600 mt-1">Active participation</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Complaints Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.resolvedComplaints || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">of {stats?.totalComplaints || 0} total</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest civic engagement activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    ))}
                    <div className="pt-4">
                      <Link href="/profile">
                        <Button variant="outline" className="w-full">
                          View All Activity
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                    <p className="text-gray-600">Start engaging with your community to see activity here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active DAO Proposals */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  Active Proposals
                </CardTitle>
                <CardDescription>Vote on important community decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProposals.length > 0 ? (
                    activeProposals.map((proposal) => (
                      <div key={proposal.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">{proposal.title}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{proposal.current_votes} votes</span>
                            <span>{Math.round((proposal.current_votes / proposal.required_votes) * 100)}%</span>
                          </div>
                          <Progress value={(proposal.current_votes / proposal.required_votes) * 100} className="h-2" />
                          <p className="text-xs text-gray-500">
                            Deadline: {new Date(proposal.voting_end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/dao/proposals/${proposal.id}`}>
                          <Button size="sm" className="w-full mt-2">
                            <Vote className="w-3 h-3 mr-1" />
                            Vote Now
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                      <p className="text-gray-600">No proposals available for voting at the moment.</p>
                    </div>
                  )}
                  <Link href="/dao/proposals">
                    <Button variant="outline" className="w-full">
                      View All Proposals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
