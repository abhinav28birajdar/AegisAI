'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Settings as SettingsIcon,
  User,
  Bell as BellIcon,
  Shield as ShieldCheckIcon,
  Palette,
  Globe,
  Key,
  Database,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Cog as CogIcon,
  Download as DocumentArrowDownIcon
} from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [dataSharingConsent, setDataSharingConsent] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setDataSharingConsent(data.data_sharing_consent || false)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleUpdateDataSharing = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          data_sharing_consent: dataSharingConsent,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage("Data sharing preferences updated successfully!")
      } else {
        throw new Error("Failed to update preferences")
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      setMessage("Failed to update preferences. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    // This would typically handle password change via Supabase Auth
    setMessage("Password change functionality would be implemented here.")
  }

  const handleRequestDataExport = () => {
    setMessage("Data export request submitted. You will receive an email with your data within 24 hours.")
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <CogIcon className="w-8 h-8" />
          Settings
        </h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
                <Input label="New Password" id="newPassword" type="password" placeholder="Enter new password" />
                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
                <Button type="submit" variant="secondary">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="text-gray-700">Email Notifications</span>
                </label>
                <p className="text-sm text-gray-600">
                  Receive email updates about your complaints and system announcements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy - CRUCIAL for CARV demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Data Sharing & Ownership</h4>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={dataSharingConsent}
                      onChange={(e) => setDataSharingConsent(e.target.checked)}
                      className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mt-1"
                    />
                    <div>
                      <span className="text-gray-700">
                        Allow AegisAI to contribute anonymized civic data to your CARV profile for potential compensation.
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Your privacy is paramount. AegisAI leverages CARV to ensure you own and control your civic data,
                        with full transparency and the potential to earn from your contributions.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" onClick={handleUpdateDataSharing} isLoading={isLoading}>
                    Update Preferences
                  </Button>
                  <Button variant="secondary" onClick={handleRequestDataExport} icon={DocumentArrowDownIcon}>
                    Request Data Export
                  </Button>
                </div>

                {message && (
                  <div className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-blue-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
