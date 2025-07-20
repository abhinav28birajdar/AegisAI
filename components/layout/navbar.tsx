"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { 
  ChevronDown, 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  FileText, 
  Vote, 
  Users,
  Shield,
  Coins,
  Heart,
  Zap
} from "lucide-react"
import Image from "next/image"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  reputation_score?: number
  carv_id?: string
}

export const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          setLoading(false)
          return
        }

        setUser(currentUser)

        if (currentUser) {
          // Get user profile from correct table name
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (profileError) {
            console.error('Error getting profile:', profileError)
            // Create profile if it doesn't exist
            if (profileError.code === 'PGRST116') {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: currentUser.id,
                  email: currentUser.email,
                  full_name: currentUser.user_metadata?.full_name || '',
                  avatar_url: currentUser.user_metadata?.avatar_url || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single()

              if (!createError && newProfile) {
                setProfile(newProfile)
              }
            }
          } else {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error in getCurrentUser:', error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
        getCurrentUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="AegisAI"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-blue-600">AegisAI</span>
          </Link>

          {/* Navigation Items (for authenticated users) */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/submit-complaint" className="text-gray-700 hover:text-blue-600 font-medium">
                Report Issue
              </Link>
              <Link href="/dao/proposals" className="text-gray-700 hover:text-blue-600 font-medium">
                DAO
              </Link>
              <Link href="/community/events" className="text-gray-700 hover:text-blue-600 font-medium">
                Community
              </Link>
              <Link href="/volunteer" className="text-gray-700 hover:text-blue-600 font-medium">
                Volunteer
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-blue-600 font-medium">
                Features
              </Link>
            </div>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* CARV ID Badge */}
                {profile?.carv_id && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Shield className="w-3 h-3 mr-1" />
                    CARV ID: {profile.carv_id.slice(0, 8)}...
                  </Badge>
                )}

                {/* Reputation Score */}
                {profile?.reputation_score !== undefined && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <Coins className="w-3 h-3 mr-1" />
                    {profile.reputation_score}
                  </Badge>
                )}

                {/* Notifications */}
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block font-medium">{getUserDisplayName()}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/complaints" className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        My Issues
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dao/proposals" className="flex items-center">
                        <Vote className="w-4 h-4 mr-2" />
                        DAO
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/community/events" className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Community
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/volunteer" className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Volunteer
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/features" className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Features
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
