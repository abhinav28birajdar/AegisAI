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
  Calendar, 
  MessageSquare, 
  Users, 
  Heart,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Zap,
  ArrowRight,
  Globe,
  Shield,
  Award,
  Target
} from 'lucide-react'

interface CommunityStats {
  totalMembers: number
  activeEvents: number
  onlineMembers: number
  totalMessages: number
  completedProjects: number
  volunteersActive: number
}

interface QuickEvent {
  id: string
  title: string
  date: string
  participants: number
  category: string
}

interface RecentActivity {
  id: string
  type: 'event' | 'message' | 'volunteer' | 'achievement'
  title: string
  time: string
  user?: string
}

export default function CommunityPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<QuickEvent[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push('/auth/signin')
      } else {
        fetchCommunityData()
      }
    }
  }, [mounted, authLoading, user, router])

  const fetchCommunityData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch community statistics
      const [
        { count: totalMembers },
        { count: activeEvents },
        { count: totalMessages }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('community_events').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true })
      ])

      const communityStats: CommunityStats = {
        totalMembers: totalMembers || 0,
        activeEvents: activeEvents || 0,
        onlineMembers: Math.floor((totalMembers || 0) * 0.15), // Estimate 15% online
        totalMessages: totalMessages || 0,
        completedProjects: 25, // Mock for now
        volunteersActive: 12 // Mock for now
      }

      setStats(communityStats)

      // Fetch upcoming events
      const { data: events } = await supabase
        .from('community_events')
        .select('*')
        .eq('status', 'scheduled')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4)

      const quickEvents: QuickEvent[] = events?.map(event => ({
        id: event.id,
        title: event.title,
        date: event.start_date,
        participants: event.current_participants || 0,
        category: event.category
      })) || []

      setUpcomingEvents(quickEvents)

      // Mock recent activity for now
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'event',
          title: 'New community cleanup event created',
          time: '2 hours ago',
          user: 'Sarah Chen'
        },
        {
          id: '2',
          type: 'message',
          title: 'Active discussion in General Chat',
          time: '4 hours ago'
        },
        {
          id: '3',
          type: 'volunteer',
          title: 'New volunteer signed up for tree planting',
          time: '6 hours ago',
          user: 'Mike Johnson'
        },
        {
          id: '4',
          type: 'achievement',
          title: 'Community reached 500 members milestone!',
          time: '1 day ago'
        }
      ]

      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching community data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 text-green-500" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'volunteer':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700'
      case 'volunteer':
        return 'bg-green-100 text-green-700'
      case 'social':
        return 'bg-purple-100 text-purple-700'
      case 'educational':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Show loading while mounting or authenticating
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading community...</p>
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
              <p className="text-gray-600">Connect, collaborate, and make a difference together</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link href="/community/events">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Button>
            </Link>
            <Link href="/community/chat">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Rooms
              </Button>
            </Link>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Community Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalMembers || 0}</p>
                  <p className="text-sm text-green-600 mt-1">{stats?.onlineMembers || 0} online now</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents || 0}</p>
                  <p className="text-sm text-blue-600 mt-1">This month</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.volunteersActive || 0}</p>
                  <p className="text-sm text-red-600 mt-1">Ready to help</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-sm font-medium text-gray-600">Join</p>
                    <p className="text-lg font-semibold">Chat Rooms</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/volunteer">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Become a</p>
                    <p className="text-lg font-semibold">Volunteer</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600" />
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
                    <p className="text-sm font-medium text-gray-600">Participate in</p>
                    <p className="text-lg font-semibold">Governance</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Join these community activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                              <Users className="w-3 h-3 ml-2" />
                              {event.participants} participants
                            </div>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                    ))}
                    <div className="pt-4">
                      <Link href="/community/events">
                        <Button variant="outline" className="w-full">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View All Events
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-gray-600 mb-4">Be the first to create a community event!</p>
                    <Link href="/community/events">
                      <Button>
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>What's happening in the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.user && (
                          <p className="text-xs text-gray-600">by {activity.user}</p>
                        )}
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Link href="/community/chat">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Discussions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Community Impact
            </CardTitle>
            <CardDescription>See the difference we're making together</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedProjects || 0}</p>
                <p className="text-sm text-gray-600">Projects Completed</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
                <p className="text-sm text-gray-600">Messages Exchanged</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.volunteersActive || 0}</p>
                <p className="text-sm text-gray-600">Active Volunteers</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-yellow-100 rounded-lg w-fit mx-auto mb-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
