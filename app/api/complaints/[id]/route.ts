import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateMockTxHash } from "@/lib/mock-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: complaint, error } = await supabase
      .from("complaints")
      .select(`
        *,
        reporter:profiles!reporter_id(display_name, email),
        assigned_to:profiles!assigned_to_employee_id(display_name, email)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      throw error
    }

    // Fetch status history
    const { data: statusHistory, error: historyError } = await supabase
      .from("status_history")
      .select(`
        *,
        updated_by:profiles!updated_by_id(display_name, email)
      `)
      .eq("complaint_id", params.id)
      .order("updated_at", { ascending: true })

    if (historyError) {
      throw historyError
    }

    return NextResponse.json({
      ...complaint,
      status_history: statusHistory,
    })
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has employee or admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["employee", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status, notes, resolution_image_urls } = await request.json()

    // Update complaint status
    const { error: updateError } = await supabase.from("complaints").update({ status }).eq("id", params.id)

    if (updateError) {
      throw updateError
    }

    // Generate mock blockchain hash for status update
    const blockchainTxHash = generateMockTxHash()

    // Insert status history
    const { error: historyError } = await supabase.from("status_history").insert({
      complaint_id: params.id,
      status,
      updated_by_id: user.id,
      notes,
      resolution_image_urls: resolution_image_urls || [],
      blockchain_tx_hash_mock: blockchainTxHash,
    })

    if (historyError) {
      throw historyError
    }

    // Fetch updated complaint
    const { data: updatedComplaint, error: fetchError } = await supabase
      .from("complaints")
      .select(`
        *,
        reporter:profiles!reporter_id(display_name, email),
        assigned_to:profiles!assigned_to_employee_id(display_name, email)
      `)
      .eq("id", params.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      ...updatedComplaint,
      new_blockchain_tx_hash: blockchainTxHash,
    })
  } catch (error) {
    console.error("Error updating complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
