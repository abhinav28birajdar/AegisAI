'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Heart,
  Share,
  MessageSquare,
  CheckCircle
} from 'lucide-react'

interface CommunityEvent {
  id: string
  title: string
  description: string
  category: 'cleanup' | 'meeting' | 'workshop' | 'fundraiser' | 'social'
  date: string
  time: string
  location: string
  organizer: string
  attendees_count: number
  max_attendees?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  image_url?: string
  is_registered: boolean
}

export default function CommunityEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'my-events'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Mock events data
      const mockEvents: CommunityEvent[] = [
        {
          id: '1',
          title: 'Neighborhood Cleanup Day',
          description: 'Join us for our monthly community cleanup. We\'ll provide all supplies including gloves, trash bags, and refreshments.',
          category: 'cleanup',
          date: '2024-02-15',
          time: '09:00',
          location: 'Central Park Entrance',
          organizer: 'Green Community Initiative',
          attendees_count: 45,
          max_attendees: 60,
          status: 'upcoming',
          is_registered: true
        },
        {
          id: '2',
          title: 'Town Hall Meeting: Infrastructure Updates',
          description: 'Monthly town hall meeting to discuss ongoing infrastructure projects and upcoming improvements.',
          category: 'meeting',
          date: '2024-02-20',
          time: '19:00',
          location: 'Community Center',
          organizer: 'City Council',
          attendees_count: 128,
          max_attendees: 200,
          status: 'upcoming',
          is_registered: false
        },
        {
          id: '3',
          title: 'Digital Literacy Workshop',
          description: 'Free workshop for seniors to learn basic computer and smartphone skills. All skill levels welcome.',
          category: 'workshop',
          date: '2024-02-18',
          time: '14:00',
          location: 'Public Library',
          organizer: 'Tech for All',
          attendees_count: 22,
          max_attendees: 30,
          status: 'upcoming',
          is_registered: true
        },
        {
          id: '4',
          title: 'Community Garden Fundraiser',
          description: 'Help us raise funds for the new community garden project. Food, music, and family activities.',
          category: 'fundraiser',
          date: '2024-02-25',
          time: '12:00',
          location: 'Main Street Plaza',
          organizer: 'Garden Committee',
          attendees_count: 87,
          max_attendees: 150,
          status: 'upcoming',
          is_registered: false
        },
        {
          id: '5',
          title: 'Winter Food Drive',
          description: 'Annual winter food drive to support local families in need. Drop off non-perishable items.',
          category: 'social',
          date: '2024-02-10',
          time: '10:00',
          location: 'Community Center',
          organizer: 'Local Food Bank',
          attendees_count: 156,
          status: 'completed',
          is_registered: true
        }
      ]

      setEvents(mockEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const registerForEvent = async (eventId: string) => {
    try {
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, is_registered: true, attendees_count: event.attendees_count + 1 }
            : event
        )
      )
      
      // In a real implementation, this would update Supabase
      console.log('Registered for event:', eventId)
    } catch (error) {
      console.error('Error registering for event:', error)
    }
  }

  const unregisterFromEvent = async (eventId: string) => {
    try {
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, is_registered: false, attendees_count: Math.max(0, event.attendees_count - 1) }
            : event
        )
      )
      
      // In a real implementation, this would update Supabase
      console.log('Unregistered from event:', eventId)
    } catch (error) {
      console.error('Error unregistering from event:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleanup':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'workshop':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'fundraiser':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'social':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming' && event.status !== 'upcoming') return false
    if (filter === 'my-events' && !event.is_registered) return false
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Join Community Events</h2>
              <p className="text-gray-600 mb-4">Please sign in to view and register for community events.</p>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/community">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Community Events</h1>
              <p className="text-gray-600">Discover and join local community activities</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/community/chat">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Community Chat
              </Button>
            </Link>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="my-events">My Events</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-gray-600">
                    {filter === 'my-events' 
                      ? 'You haven\'t registered for any events yet.' 
                      : 'No events match your search criteria.'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={getCategoryColor(event.category)}
                      >
                        {event.category}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    {event.is_registered && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.attendees_count} attendees
                        {event.max_attendees && ` / ${event.max_attendees}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {event.status === 'upcoming' && (
                      event.is_registered ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unregisterFromEvent(event.id)}
                          className="flex-1"
                        >
                          Unregister
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => registerForEvent(event.id)}
                          className="flex-1"
                          disabled={!!(event.max_attendees && event.attendees_count >= event.max_attendees)}
                        >
                          {event.max_attendees && event.attendees_count >= event.max_attendees
                            ? 'Full'
                            : 'Register'
                          }
                        </Button>
                      )
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
