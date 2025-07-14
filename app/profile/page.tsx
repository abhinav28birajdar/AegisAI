"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { UserCircleIcon, LinkIcon } from "@heroicons/react/24/outline"

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
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
        setDisplayName(data.display_name || "")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      let avatarUrl = profile?.avatar_url

      // Upload avatar if selected
      if (avatarFile) {
        const fileName = `${Date.now()}-${avatarFile.name}`
        const { data, error } = await supabase.storage.from("profile-pictures").upload(fileName, avatarFile)

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-pictures").getPublicUrl(fileName)

        avatarUrl = publicUrl
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage("Profile updated successfully!")
        setAvatarFile(null)
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkCARV = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          carv_did_linked: true,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setMessage("CARV ID linked successfully!")
      }
    } catch (error) {
      console.error("Error linking CARV:", error)
      setMessage("Failed to link CARV ID. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Profile Form */}
          <Card>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email" id="email" type="email" value={profile.email} disabled />
                <Input label="Role" id="role" value={profile.role} disabled />
              </div>

              <Input
                label="Display Name"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />

              {message && (
                <div className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </div>
              )}

              <Button type="submit" variant="primary" isLoading={isLoading}>
                Save Profile
              </Button>
            </form>
          </Card>

          {/* CARV Integration Card */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-violet-600" />
              Decentralized Identity (DID) & Reputation
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">CARV ID Linked:</span>
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    profile.carv_did_linked ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {profile.carv_did_linked ? "Connected" : "Not Connected"}
                </span>
              </div>

              <Button
                variant={profile.carv_did_linked ? "secondary" : "primary"}
                onClick={handleLinkCARV}
                disabled={profile.carv_did_linked}
              >
                {profile.carv_did_linked ? "Manage CARV ID" : "Link Your CARV ID"}
              </Button>

              <p className="text-sm text-gray-600">
                AegisAI leverages your CARV DID for verified contributions and civic reputation. Learn more about CARV's
                data attestation and how you can own and monetize your civic data.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
