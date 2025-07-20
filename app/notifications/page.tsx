'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import {
  Bell,
  Check,
  CheckCheck,
  Vote,
  Users,
  AlertTriangle,
  Calendar,
  Award,
  Settings,
  ArrowLeft,
  Trash2,
  Eye
} from 'lucide-react'

interface Notification {
  id: string
  type: 'complaint' | 'dao_vote' | 'community' | 'volunteer' | 'system' | 'reward'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
  priority: 'low' | 'medium' | 'high'
  related_id?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'complaint',
          title: 'Complaint Update',
          message: 'Your complaint about "Broken streetlight on Main St" has been reviewed and marked as resolved.',
          read: false,
          created_at: new Date(Date.now() - 300000).toISOString(),
          action_url: '/complaints/123',
          priority: 'medium',
          related_id: '123'
        },
        {
          id: '2',
          type: 'dao_vote',
          title: 'New Proposal to Vote',
          message: 'A new proposal "Community Park Renovation Project" is now available for voting. Your participation is important!',
          read: false,
          created_at: new Date(Date.now() - 600000).toISOString(),
          action_url: '/dao/proposals/456',
          priority: 'high',
          related_id: '456'
        },
        {
          id: '3',
          type: 'reward',
          title: 'Reputation Reward',
          message: 'You earned 50 reputation points for your active participation in community governance!',
          read: false,
          created_at: new Date(Date.now() - 900000).toISOString(),
          priority: 'medium'
        },
        {
          id: '4',
          type: 'community',
          title: 'New Community Event',
          message: 'Join us for the "Neighborhood Cleanup Day" this Saturday at 9 AM. Volunteers needed!',
          read: true,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          action_url: '/community/events/789',
          priority: 'medium',
          related_id: '789'
        },
        {
          id: '5',
          type: 'volunteer',
          title: 'Volunteer Opportunity',
          message: 'A new volunteer opportunity matching your interests has been posted: "Community Garden Maintenance"',
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          action_url: '/community/volunteer',
          priority: 'low'
        }
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'dao_vote':
        return <Vote className="w-5 h-5 text-blue-500" />
      case 'community':
        return <Users className="w-5 h-5 text-green-500" />
      case 'volunteer':
        return <Calendar className="w-5 h-5 text-purple-500" />
      case 'reward':
        return <Award className="w-5 h-5 text-yellow-500" />
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return time.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false
    if (filter === 'read' && !notif.read) return false
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">View Your Notifications</h2>
              <p className="text-gray-600 mb-4">Please sign in to see your personalized notifications.</p>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
                </Button>
                <Button
                  variant={filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('read')}
                >
                  Read
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('all')}
                >
                  All Types
                </Button>
                <Button
                  variant={typeFilter === 'dao_vote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('dao_vote')}
                >
                  DAO Votes
                </Button>
                <Button
                  variant={typeFilter === 'complaint' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('complaint')}
                >
                  Complaints
                </Button>
                <Button
                  variant={typeFilter === 'community' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('community')}
                >
                  Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          <div className="flex gap-2">
                            {notification.action_url && (
                              <Link href={notification.action_url}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                            )}
                            
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}