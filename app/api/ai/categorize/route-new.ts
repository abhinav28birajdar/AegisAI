import { type NextRequest, NextResponse } from "next/server"
import { analyzeComplaint, detectEmergency } from "@/lib/gemini-ai"

// Enhanced AI categorization with Gemini AI
interface AICategorizationRequest {
  title: string
  description: string
  image_urls?: string[]
  location?: string
  reporterHistory?: string
  urgencyKeywords?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: AICategorizationRequest = await request.json()
    const { title, description, location, reporterHistory } = body
    
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }
    
    // Get comprehensive AI analysis using Gemini
    const [analysis, emergencyCheck] = await Promise.all([
      analyzeComplaint(title, description, location),
      detectEmergency(title, description)
    ])
    
    // Determine AI agent based on analysis
    let aiAgent = "TriageAgent"
    let coordinationNotes = "AI analysis completed successfully"
    
    if (emergencyCheck.isEmergency || analysis.urgency === 'critical') {
      aiAgent = "EmergencyTriageAgent"
      coordinationNotes = "EMERGENCY: Immediate escalation required"
    } else if (analysis.priority >= 4 || analysis.urgency === 'high') {
      aiAgent = "PriorityTriageAgent"
      coordinationNotes = "High priority - expedited processing"
    }
    
    // Enhanced response with reporter history consideration
    let adjustedConfidence = analysis.confidence
    if (reporterHistory === 'verified') {
      adjustedConfidence = Math.min(95, adjustedConfidence + 10)
      coordinationNotes += ". Verified reporter - increased confidence"
    } else if (reporterHistory === 'new') {
      adjustedConfidence = Math.max(50, adjustedConfidence - 5)
      coordinationNotes += ". New reporter - standard verification"
    }
    
    // Build comprehensive response
    const response = {
      // Core categorization
      category: analysis.category,
      subcategory: analysis.subcategory,
      priority: analysis.priority,
      urgency: analysis.urgency,
      severity: analysis.isEmergency ? 'critical' : analysis.urgency,
      
      // AI insights
      sentiment: analysis.sentiment,
      confidence: adjustedConfidence,
      aiAgent,
      coordinationNotes,
      
      // Department routing
      suggestedDepartment: analysis.department,
      estimatedResolutionTime: `${analysis.estimatedResolutionDays} days`,
      
      // Emergency handling
      isEmergency: emergencyCheck.isEmergency,
      emergencyLevel: emergencyCheck.urgencyLevel,
      emergencyReasoning: emergencyCheck.reasoning,
      recommendedActions: emergencyCheck.recommendedActions,
      
      // Metadata
      tags: [
        ...analysis.tags,
        `priority_${analysis.priority}`,
        `urgency_${analysis.urgency}`,
        `sentiment_${analysis.sentiment}`,
        ...(location ? [`location_${location.toLowerCase().replace(/\s+/g, '_')}`] : [])
      ],
      
      // Enhanced features
      multiAgentProcessing: true,
      blockchainReady: true,
      carvAttestationEligible: adjustedConfidence >= 70,
      web3Integration: {
        smartContractReady: true,
        ipfsEligible: true,
        reputationImpact: analysis.priority >= 3 ? 'positive' : 'neutral'
      },
      
      // Processing metadata
      modelUsed: 'gemini-1.5-flash',
      processingTime: Date.now(),
      summary: analysis.summary
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error("AI categorization error:", error)
    
    // Fallback response
    return NextResponse.json({
      error: "AI analysis temporarily unavailable",
      fallback: true,
      category: "General",
      priority: 3,
      urgency: "medium",
      confidence: 50,
      suggestedDepartment: "General Services",
      estimatedResolutionTime: "7 days",
      aiAgent: "FallbackAgent",
      coordinationNotes: "Using fallback categorization",
      isEmergency: false,
      tags: ["general", "fallback"],
      multiAgentProcessing: false,
      blockchainReady: true,
      carvAttestationEligible: false
    }, { status: 200 })
  }
}
