'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Activity, 
  MessageSquare, 
  Vote, 
  FileText, 
  Trophy, 
  Coins,
  Calendar,
  Filter,
  Search,
  TrendingUp
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'complaint_created',
    title: 'Reported Infrastructure Issue',
    description: 'Submitted report about pothole on Main Street',
    points: 50,
    date: '2025-01-18T10:30:00Z',
    status: 'completed',
    relatedId: 'complaint_1'
  },
  {
    id: '2',
    type: 'vote_cast',
    title: 'Voted on Community Proposal',
    description: 'Cast vote on "Upgrade WiFi Infrastructure" proposal',
    points: 25,
    date: '2025-01-17T15:45:00Z',
    status: 'completed',
    relatedId: 'proposal_1'
  },
  {
    id: '3',
    type: 'comment_created',
    title: 'Added Helpful Comment',
    description: 'Provided additional information on park maintenance report',
    points: 15,
    date: '2025-01-16T09:20:00Z',
    status: 'completed',
    relatedId: 'comment_1'
  },
  {
    id: '4',
    type: 'achievement_unlocked',
    title: 'Community Champion',
    description: 'Unlocked for completing 5 civic activities',
    points: 100,
    date: '2025-01-15T14:00:00Z',
    status: 'completed',
    relatedId: 'achievement_1'
  },
  {
    id: '5',
    type: 'proposal_created',
    title: 'Created DAO Proposal',
    description: 'Proposed new community garden initiative',
    points: 75,
    date: '2025-01-14T11:15:00Z',
    status: 'completed',
    relatedId: 'proposal_2'
  }
]

const activityIcons = {
  complaint_created: FileText,
  vote_cast: Vote,
  comment_created: MessageSquare,
  achievement_unlocked: Trophy,
  proposal_created: Vote,
  token_earned: Coins
}

const activityColors = {
  complaint_created: 'bg-blue-100 text-blue-600',
  vote_cast: 'bg-purple-100 text-purple-600',
  comment_created: 'bg-green-100 text-green-600',
  achievement_unlocked: 'bg-yellow-100 text-yellow-600',
  proposal_created: 'bg-indigo-100 text-indigo-600',
  token_earned: 'bg-orange-100 text-orange-600'
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState(mockActivities)
  const [filteredActivities, setFilteredActivities] = useState(mockActivities)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    let filtered = activities

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType)
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(activity => new Date(activity.date) >= cutoffDate)
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, filterType, dateRange])

  const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0)
  const weeklyPoints = activities.filter(activity => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(activity.date) >= weekAgo
  }).reduce((sum, activity) => sum + activity.points, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
                <p className="text-gray-600">Track your civic engagement and contributions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Points</div>
                <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">This Week</div>
                <div className="text-2xl font-bold text-green-600">+{weeklyPoints}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Filed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'complaint_created').length}
              </div>
              <p className="text-xs text-muted-foreground">Issues reported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'vote_cast').length}
              </div>
              <p className="text-xs text-muted-foreground">DAO participation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'achievement_unlocked').length}
              </div>
              <p className="text-xs text-muted-foreground">Unlocked badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="complaint_created">Reports</SelectItem>
                  <SelectItem value="vote_cast">Votes</SelectItem>
                  <SelectItem value="comment_created">Comments</SelectItem>
                  <SelectItem value="proposal_created">Proposals</SelectItem>
                  <SelectItem value="achievement_unlocked">Achievements</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <CardDescription>
              Your civic engagement history and earned points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || Activity
                  const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'bg-gray-100 text-gray-600'
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{activity.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(activity.date)}
                              </Badge>
                              {activity.points > 0 && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <Coins className="w-3 h-3 mr-1" />
                                  +{activity.points} points
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Progress */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Achievement Progress</CardTitle>
            <CardDescription>
              Work towards unlocking new badges and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Active Reporter</h4>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">3/5 reports filed</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Democracy Advocate</h4>
                  <Vote className="w-5 h-5 text-purple-500" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">1/5 DAO votes cast</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Community Builder</h4>
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">4/5 helpful comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
