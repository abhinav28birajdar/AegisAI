'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Database,
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

export default function SettingsPageNew() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    complaints: true,
    proposals: true,
    rewards: true
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showActivity: false,
    shareLocation: true
  })

  const [showApiKey, setShowApiKey] = useState(false)

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
                <Settings className="w-6 h-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Demo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="User" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="demo@aegisai.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City, Country" defaultValue="San Francisco, CA" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="complaint-updates">Complaint Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about complaint status changes</p>
                  </div>
                  <Switch
                    id="complaint-updates"
                    checked={notifications.complaints}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, complaints: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="proposal-updates">DAO Proposal Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about new proposals and voting</p>
                  </div>
                  <Switch
                    id="proposal-updates"
                    checked={notifications.proposals}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, proposals: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reward-updates">Token Rewards</Label>
                    <p className="text-sm text-gray-500">Get notified when you earn CIVIC tokens</p>
                  </div>
                  <Switch
                    id="reward-updates"
                    checked={notifications.rewards}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, rewards: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, publicProfile: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-activity">Show Activity</Label>
                    <p className="text-sm text-gray-500">Display your civic activities publicly</p>
                  </div>
                  <Switch
                    id="show-activity"
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, showActivity: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-location">Share Location</Label>
                    <p className="text-sm text-gray-500">Allow location-based features</p>
                  </div>
                  <Switch
                    id="share-location"
                    checked={privacy.shareLocation}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, shareLocation: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <p className="text-sm text-gray-500 mb-2">Your personal API key for external integrations</p>
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value="ak_demo_1234567890abcdef"
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500 mb-2">Add an extra layer of security to your account</p>
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Blockchain & Web3</span>
              </CardTitle>
              <CardDescription>
                Manage your blockchain connections and Web3 preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Connected Wallet</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg mt-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <p className="text-sm text-gray-500">0x742d...8E73</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>CARV ID</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg mt-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">CARV Protocol</p>
                        <p className="text-sm text-gray-500">carv_demo123</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Network Preferences</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Ethereum Mainnet</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Polygon</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
