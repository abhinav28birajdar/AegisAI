import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Complaint {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  location: string
  user_id?: string
  anonymous: boolean
  created_at: string
  updated_at: string
  assigned_department?: string
  resolution_notes?: string
  upvotes: number
  downvotes: number
  ai_category?: string
  ai_priority?: string
  ai_confidence?: number
}

export interface Notification {
  id: string
  user_id: string
  type: 'complaint_update' | 'new_message' | 'system' | 'achievement'
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  location?: string
  phone?: string
  notification_preferences: Record<string, boolean>
  reputation_score: number
  total_complaints: number
  resolved_complaints: number
  created_at: string
  updated_at: string
}

// Real-time complaints hook
export function useRealtimeComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchComplaints = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setComplaints(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints')
      console.error('Error fetching complaints:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchComplaints()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          console.log('Complaint change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            setComplaints(prev => [payload.new as Complaint, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setComplaints(prev => 
              prev.map(complaint => 
                complaint.id === payload.new.id ? payload.new as Complaint : complaint
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setComplaints(prev => 
              prev.filter(complaint => complaint.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchComplaints])

  const submitComplaint = async (complaintData: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes'>) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert([complaintData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error submitting complaint:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit complaint' }
    }
  }

  const updateComplaintStatus = async (id: string, status: Complaint['status'], resolution_notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({ 
          status, 
          resolution_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error updating complaint:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update complaint' }
    }
  }

  const voteOnComplaint = async (id: string, voteType: 'upvote' | 'downvote') => {
    try {
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('upvotes, downvotes')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const updateData = voteType === 'upvote' 
        ? { upvotes: complaint.upvotes + 1 }
        : { downvotes: complaint.downvotes + 1 }

      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error voting on complaint:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to vote' }
    }
  }

  return {
    complaints,
    loading,
    error,
    submitComplaint,
    updateComplaintStatus,
    voteOnComplaint,
    refetch: fetchComplaints
  }
}

// Real-time notifications hook
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const notificationData = data || []
      setNotifications(notificationData)
      setUnreadCount(notificationData.filter(n => !n.read).length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notification change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === payload.new.id ? payload.new as Notification : notification
              )
            )
            // Recalculate unread count
            setUnreadCount(prev => {
              const updatedNotification = payload.new as Notification
              const oldNotification = payload.old as Notification
              if (oldNotification.read !== updatedNotification.read) {
                return updatedNotification.read ? prev - 1 : prev + 1
              }
              return prev
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to mark as read' }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to mark all as read' }
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Error deleting notification:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete notification' }
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}

// Real-time user profile hook
export function useRealtimeUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        (payload) => {
          console.log('Profile change received:', payload)
          
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new as UserProfile)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchProfile])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' }
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  }
}

// Real-time connection status hook
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const testChannel = supabase
      .channel('connection-test')
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true)
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false)
      })
      .subscribe()

    setChannel(testChannel)

    return () => {
      supabase.removeChannel(testChannel)
    }
  }, [supabase])

  return { isConnected, channel }
}
