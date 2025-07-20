'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/lib/auth-context'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft,
  MessageSquare,
  Send,
  Users,
  Hash,
  Plus,
  Settings,
  Search,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip
} from 'lucide-react'

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  user_profiles?: {
    full_name: string
    avatar_url: string
  }
}

interface ChatRoom {
  id: string
  name: string
  description: string
  type: 'community' | 'dao' | 'volunteer'
  member_count: number
  is_member: boolean
}

export default function CommunityChat() {
  const { user } = useAuth()
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      fetchChatRooms()
    }
  }, [user])

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom)
      setupRealtimeSubscription(activeRoom)
    }
  }, [activeRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
      // Create mock chat rooms based on different areas
      const mockRooms: ChatRoom[] = [
        {
          id: 'general',
          name: 'General Discussion',
          description: 'General community chat',
          type: 'community',
          member_count: 156,
          is_member: true
        },
        {
          id: 'dao-governance',
          name: 'DAO Governance',
          description: 'Discuss proposals and governance',
          type: 'dao',
          member_count: 89,
          is_member: true
        },
        {
          id: 'volunteers',
          name: 'Volunteer Coordination',
          description: 'Coordinate volunteer activities',
          type: 'volunteer',
          member_count: 67,
          is_member: true
        },
        {
          id: 'local-issues',
          name: 'Local Issues',
          description: 'Discuss community problems',
          type: 'community',
          member_count: 234,
          is_member: true
        }
      ]
      
      setRooms(mockRooms)
      if (mockRooms.length > 0) {
        setActiveRoom(mockRooms[0].id)
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      // Mock messages for demonstration
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Welcome to the community chat! 👋',
          user_id: 'system',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_profiles: {
            full_name: 'AegisAI Bot',
            avatar_url: ''
          }
        },
        {
          id: '2',
          content: 'Has anyone seen the new proposal about the park renovation?',
          user_id: 'user1',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          user_profiles: {
            full_name: 'Sarah Johnson',
            avatar_url: ''
          }
        },
        {
          id: '3',
          content: 'Yes! I think it\'s a great initiative. We really need better facilities.',
          user_id: 'user2',
          created_at: new Date(Date.now() - 1500000).toISOString(),
          user_profiles: {
            full_name: 'Mike Chen',
            avatar_url: ''
          }
        },
        {
          id: '4',
          content: 'I\'ve submitted my vote in favor. The plans look comprehensive.',
          user_id: 'user3',
          created_at: new Date(Date.now() - 900000).toISOString(),
          user_profiles: {
            full_name: 'Emma Davis',
            avatar_url: ''
          }
        }
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const setupRealtimeSubscription = (roomId: string) => {
    // In a real implementation, this would set up Supabase realtime subscription
    console.log('Setting up realtime subscription for room:', roomId)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeRoom) return

    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        user_id: user.id,
        created_at: new Date().toISOString(),
        user_profiles: {
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')

      // In a real implementation, this would send to Supabase
      console.log('Sending message:', message)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'dao': return '🏛️'
      case 'volunteer': return '❤️'
      default: return '💬'
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Join the Community Chat</h2>
              <p className="text-gray-600 mb-4">Please sign in to participate in community discussions.</p>
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
      <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
        <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sidebar - Chat Rooms */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Community Chat</h2>
                <Link href="/community">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search rooms..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Rooms List */}
            <div className="flex-1 overflow-y-auto">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeRoom === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setActiveRoom(room.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getRoomIcon(room.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{room.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{room.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{room.member_count} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {rooms.find(r => r.id === activeRoom)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {rooms.find(r => r.id === activeRoom)?.member_count} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={message.user_profiles?.avatar_url} />
                        <AvatarFallback>
                          {getInitials(message.user_profiles?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.user_profiles?.full_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder={`Message #${rooms.find(r => r.id === activeRoom)?.name.toLowerCase().replace(/\s+/g, '-')}`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          size="sm"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a chat room</h3>
                  <p className="text-gray-600">Choose a room from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
