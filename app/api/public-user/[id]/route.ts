import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch public profile data
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, carv_did_linked")
      .eq("id", params.id)
      .single()

    if (error) {
      throw error
    }

    // Simulate contribution stats
    const { count: totalComplaints } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("reporter_id", params.id)

    const { count: resolvedComplaints } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("reporter_id", params.id)
      .eq("status", "resolved")

    const stats = {
      complaints_submitted: totalComplaints || 0,
      complaints_resolved: resolvedComplaints || 0,
    }

    return NextResponse.json({
      profile,
      stats,
    })
  } catch (error) {
    console.error("Error fetching public profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
