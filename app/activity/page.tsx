'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft,
  FileText,
  Vote,
  Users,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
  Zap
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'complaint' | 'dao_vote' | 'community_join' | 'volunteer_apply' | 'comment'
  title: string
  description: string
  timestamp: string
  status?: string
  icon: any
  color: string
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchUserActivity()
    }
  }, [user])

  const fetchUserActivity = async () => {
    try {
      setLoading(true)
      const activities: ActivityItem[] = []

      // Fetch complaints
      const { data: complaints } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      complaints?.forEach(complaint => {
        activities.push({
          id: complaint.id,
          type: 'complaint',
          title: `Complaint: ${complaint.title}`,
          description: `Status: ${complaint.status}`,
          timestamp: complaint.created_at,
          status: complaint.status,
          icon: FileText,
          color: 'bg-blue-500'
        })
      })

      // Fetch DAO votes
      const { data: votes } = await supabase
        .from('dao_votes')
        .select('*, dao_proposals(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      votes?.forEach(vote => {
        activities.push({
          id: vote.id,
          type: 'dao_vote',
          title: `Voted on: ${vote.dao_proposals?.title}`,
          description: `Vote: ${vote.vote_type}`,
          timestamp: vote.created_at,
          icon: Vote,
          color: 'bg-purple-500'
        })
      })

      // Fetch community events
      const { data: participations } = await supabase
        .from('event_participants')
        .select('*, community_events(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      participations?.forEach(participation => {
        activities.push({
          id: participation.id,
          type: 'community_join',
          title: `Joined: ${participation.community_events?.title}`,
          description: `Event on ${new Date(participation.community_events?.event_date).toLocaleDateString()}`,
          timestamp: participation.created_at,
          icon: Users,
          color: 'bg-green-500'
        })
      })

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(activities)
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to view your activity.</p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-600" />
              Your Activity
            </h1>
            <p className="text-gray-600">
              Track all your interactions and contributions on AegisAI
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All Activity', icon: Zap },
            { key: 'complaint', label: 'Complaints', icon: FileText },
            { key: 'dao_vote', label: 'DAO Votes', icon: Vote },
            { key: 'community_join', label: 'Community', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-gray-600 mb-4">
                Start engaging with the platform to see your activity here.
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/submit-complaint">
                  <Button size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Complaint
                  </Button>
                </Link>
                <Link href="/dao">
                  <Button variant="outline" size="sm">
                    <Vote className="w-4 h-4 mr-2" />
                    Join DAO
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                            <p className="text-gray-600 text-sm">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            {activity.status && (
                              <Badge className={`mb-1 ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </Badge>
                            )}
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
