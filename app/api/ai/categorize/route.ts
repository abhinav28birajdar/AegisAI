import { type NextRequest, NextResponse } from "next/server"
import { mockAICategorization } from "@/lib/mock-utils"

// Enhanced AI categorization with multi-agent coordination
interface AICategorizationRequest {
  description: string
  image_urls?: string[]
  location?: string
  reporterHistory?: string
  urgencyKeywords?: string[]
}

const enhancedAICategorization = (data: AICategorizationRequest) => {
  const { description, image_urls, location, reporterHistory } = data
  
  // Use enhanced mock with all new fields
  const result = mockAICategorization(description, image_urls || [])
  
  // Add AI agent coordination logic
  let aiAgent = "TriageAgent"
  let coordinationNotes = "Initial categorization completed"
  
  // Priority-based agent assignment
  if (result.priority === 'urgent') {
    aiAgent = "EmergencyTriageAgent"
    coordinationNotes = "Escalated to emergency protocols"
  } else if (result.priority === 'high') {
    aiAgent = "PriorityTriageAgent"
    coordinationNotes = "Flagged for priority handling"
  }
  
  // Add location-based intelligence
  if (location) {
    result.tags.push(`location:${location.toLowerCase().replace(/\s+/g, '_')}`)
    coordinationNotes += `. Location-based routing to ${result.suggestedDepartment}`
  }
  
  // Reporter history consideration
  if (reporterHistory === 'trusted') {
    result.confidence = Math.min(0.95, result.confidence + 0.1)
    coordinationNotes += ". Reporter has verified history"
  }
  
  return {
    ...result,
    aiAgent,
    coordinationNotes,
    multiAgentProcessing: true,
    web3Ready: result.blockchainReady,
    carvIntegration: result.carvAttestationEligible
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, image_urls, location, reporterHistory } = body

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Enhanced AI categorization with multi-agent features
    const result = enhancedAICategorization({ 
      description, 
      image_urls, 
      location, 
      reporterHistory 
    })

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      processedBy: result.aiAgent,
      version: "AegisAI-v2.0"
    })
  } catch (error) {
    console.error("Error in AI categorization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint for AI service status  
export async function GET() {
  return NextResponse.json({
    service: "AegisAI - Multi-Agent Categorization & Triage",
    status: "operational",
    version: "2.0.0",
    capabilities: [
      "Multi-agent complaint triage",
      "Priority-based routing", 
      "Department assignment",
      "Confidence scoring",
      "Location-based intelligence",
      "Reporter history analysis",
      "Web3 blockchain integration",
      "CARV attestation preparation"
    ],
    agents: [
      "TriageAgent", 
      "EmergencyTriageAgent",
      "PriorityTriageAgent",
      "LocationIntelligenceAgent"
    ],
    web3Features: [
      "Blockchain-ready data formatting",
      "CARV DID integration support", 
      "Immutable ledger preparation"
    ]
  })
}
