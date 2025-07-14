import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { ShieldCheckIcon, ClockIcon, MapPinIcon, PhotoIcon } from "@heroicons/react/24/outline"

export default async function ComplaintDetails({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch complaint details
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/complaints/${params.id}`, {
    headers: {
      Cookie: cookies().toString(),
    },
  })

  if (!response.ok) {
    redirect("/dashboard")
  }

  const complaint = await response.json()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-violet-600 hover:text-violet-500">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complaint Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Complaint Info */}
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{complaint.title}</h2>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{complaint.description}</p>
                </div>

                {complaint.location && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-700">Location</h3>
                      <p className="text-gray-600">{complaint.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Submitted {formatDate(complaint.submitted_at)}
                  </div>
                  {complaint.issue_type_ai && (
                    <div className="px-2 py-1 bg-violet-100 text-violet-700 rounded">{complaint.issue_type_ai}</div>
                  )}
                  {complaint.urgency_ai && (
                    <div
                      className={`px-2 py-1 rounded ${
                        complaint.urgency_ai === "High"
                          ? "bg-red-100 text-red-700"
                          : complaint.urgency_ai === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {complaint.urgency_ai} Priority
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Images */}
            {complaint.image_urls && complaint.image_urls.length > 0 && (
              <Card>
                <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Attached Images
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.image_urls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url || "/placeholder.svg"}
                      alt={`Complaint image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Status History */}
            {complaint.status_history && complaint.status_history.length > 0 && (
              <Card>
                <h3 className="font-medium text-gray-700 mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  {complaint.status_history.map((history: any, index: number) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-violet-600" : "bg-gray-300"}`} />
                        {index < complaint.status_history.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(history.status)}`}>
                            {history.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(history.updated_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Updated by {history.updated_by?.display_name || history.updated_by?.email}
                        </p>
                        {history.notes && <p className="text-sm text-gray-700 mt-2">{history.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Web3 Transparency Card */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-violet-600" />
                Immutable Record on Blockchain
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Complaint Recorded (Tx Hash):</p>
                  <a href="#" className="font-mono text-violet-600 hover:text-violet-500 break-all text-xs">
                    {complaint.blockchain_tx_hash_mock}
                  </a>
                </div>
                <div>
                  <p className="font-medium text-gray-700">CARV Attestation ID:</p>
                  <span className="font-mono text-violet-600 break-all text-xs">
                    {complaint.carv_attestation_id_mock}
                  </span>
                </div>
                <p className="text-gray-600 text-xs">
                  Every action, from submission to resolution, is transparently logged via CARV and the blockchain.
                </p>
              </div>
            </Card>

            {/* Reporter Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Reported By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-violet-600 font-medium">
                    {(complaint.reporter?.display_name || complaint.reporter?.email || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{complaint.reporter?.display_name || "Anonymous User"}</p>
                  <p className="text-sm text-gray-600">Citizen</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
