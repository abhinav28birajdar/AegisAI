import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch user profile data
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public-user/${resolvedParams.id}`, {
    headers: {
      Cookie: cookies().toString(),
    },
  })

  if (!response.ok) {
    redirect("/dashboard")
  }

  const userProfile = await response.json()

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name} />
            <AvatarFallback>
              {userProfile.display_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{userProfile.display_name || "User Profile"}</h1>
            <p className="text-gray-600">Public Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Public profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Display Name</label>
                <p className="text-lg">{userProfile.display_name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CARV Status</label>
                <div>
                  {userProfile.carv_did_linked ? (
                    <Badge variant="default">CARV Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Not Verified</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contribution Stats</CardTitle>
              <CardDescription>Community engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Complaints</span>
                <span className="text-lg font-bold">{userProfile.totalComplaints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Resolved Issues</span>
                <span className="text-lg font-bold text-green-600">{userProfile.resolvedComplaints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Success Rate</span>
                <span className="text-lg font-bold">
                  {userProfile.totalComplaints > 0
                    ? Math.round((userProfile.resolvedComplaints / userProfile.totalComplaints) * 100)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community Impact</CardTitle>
            <CardDescription>This user's contribution to the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600">
                This citizen has submitted {userProfile.totalComplaints || 0} complaints to help improve the community.
                {userProfile.resolvedComplaints > 0 && (
                  <span className="block mt-2 text-green-600 font-medium">
                    {userProfile.resolvedComplaints} issues have been successfully resolved!
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}