'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User,
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  Activity,
  TrendingUp,
  FileText,
  Vote,
  Coins,
  Trophy,
  Star,
  Users,
  Shield,
  CheckCircle
} from 'lucide-react'

// Mock user data
const mockProfile = {
  name: 'Demo User',
  email: 'demo@aegisai.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  joinDate: 'January 2024',
  bio: 'Passionate civic advocate working to make our community better through technology and engagement.',
  website: 'https://demo-user.com',
  avatar: '/placeholder-avatar.jpg',
  verified: true,
  
  // Stats
  civicTokens: 1247.85,
  reputationScore: 842,
  reputationTier: 'Gold',
  totalComplaints: 12,
  resolvedComplaints: 9,
  activeComplaints: 3,
  daoVotes: 8,
  proposalsCreated: 2,
  volunteerHours: 24.5,
  
  // Achievements
  badges: [
    { name: 'Community Hero', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Early Adopter', icon: Star, color: 'bg-purple-100 text-purple-800' },
    { name: 'Active Voter', icon: Vote, color: 'bg-blue-100 text-blue-800' },
    { name: 'Problem Solver', icon: CheckCircle, color: 'bg-green-100 text-green-800' }
  ],
  
  // Recent Activity
  recentActivity: [
    {
      type: 'complaint',
      title: 'Submitted pothole complaint on Main Street',
      date: '2 days ago',
      status: 'in-progress'
    },
    {
      type: 'vote',
      title: 'Voted on Solar Panel Installation Proposal',
      date: '4 days ago',
      status: 'completed'
    },
    {
      type: 'reward',
      title: 'Earned 25 CIVIC tokens for community participation',
      date: '1 week ago',
      status: 'completed'
    },
    {
      type: 'complaint',
      title: 'Streetlight repair request was resolved',
      date: '2 weeks ago',
      status: 'resolved'
    }
  ]
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(mockProfile)

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
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-xl">DU</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    {profile.verified && (
                      <>
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span className="sr-only">Verified User</span>
                      </>
                    )}
                  </div>
                  
                  <Badge variant="secondary" className={profile.badges[0].color}>
                    {profile.reputationTier} Member
                  </Badge>
                  
                  <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    {profile.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {profile.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    {profile.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    Joined {profile.joinDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={profile.website} className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Civic Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{profile.civicTokens}</span>
                    </div>
                    <p className="text-xs text-gray-500">CIVIC Tokens</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <span className="text-2xl font-bold">{profile.reputationScore}</span>
                    </div>
                    <p className="text-xs text-gray-500">Reputation</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-2xl font-bold">{profile.totalComplaints}</span>
                    </div>
                    <p className="text-xs text-gray-500">Reports Filed</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Vote className="w-4 h-4 text-green-500" />
                      <span className="text-2xl font-bold">{profile.daoVotes}</span>
                    </div>
                    <p className="text-xs text-gray-500">DAO Votes</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{Math.round((profile.resolvedComplaints / profile.totalComplaints) * 100)}%</span>
                  </div>
                  <Progress value={(profile.resolvedComplaints / profile.totalComplaints) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Your latest civic engagement activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            {activity.type === 'complaint' && <FileText className="w-4 h-4 text-blue-600" />}
                            {activity.type === 'vote' && <Vote className="w-4 h-4 text-green-600" />}
                            {activity.type === 'reward' && <Coins className="w-4 h-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              activity.status === 'resolved' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Achievements & Badges</span>
                    </CardTitle>
                    <CardDescription>
                      Recognition for your civic contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.badges.map((badge, index) => {
                        const IconComponent = badge.icon
                        return (
                          <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{badge.name}</p>
                              <p className="text-xs text-gray-500">Earned recently</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Next Achievement</h4>
                      <p className="text-sm text-gray-600 mb-2">Community Leader - Submit 5 more complaints</p>
                      <Progress value={60} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">3 of 5 completed</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Impact Analytics</span>
                    </CardTitle>
                    <CardDescription>
                      Track your civic engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Complaint Resolution Rate</span>
                            <span className="font-medium">75%</span>
                          </div>
                          <Progress value={75} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>DAO Participation</span>
                            <span className="font-medium">80%</span>
                          </div>
                          <Progress value={80} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Community Engagement</span>
                            <span className="font-medium">92%</span>
                          </div>
                          <Progress value={92} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center p-4 border rounded-lg">
                          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">156</p>
                          <p className="text-xs text-gray-500">Community Rank</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">+23%</p>
                          <p className="text-xs text-gray-500">This Month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
