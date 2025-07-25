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
    
    // Get comprehensive AI analysis using Gemini (single call to avoid rate limits)
    let analysis;
    let emergencyCheck: {
      isEmergency: boolean;
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
      reasoning: string;
      recommendedActions: string[];
    } = {
      isEmergency: false,
      urgencyLevel: 'medium',
      reasoning: 'Standard processing',
      recommendedActions: ['Review by department']
    };
    
    try {
      analysis = await analyzeComplaint(title, description, location);
      
      // Derive emergency info from the main analysis to avoid extra API calls
      emergencyCheck = {
        isEmergency: analysis.isEmergency,
        urgencyLevel: analysis.urgency,
        reasoning: analysis.isEmergency ? 'AI detected high priority issue' : 'Standard processing',
        recommendedActions: analysis.isEmergency ? ['Immediate escalation', 'Contact authorities'] : ['Review by department']
      };
    } catch (error) {
      console.warn('Gemini AI rate limited, using fallback analysis');
      // Use fallback analysis when rate limited
      analysis = getFallbackAnalysis(title, description, location);
    }
    
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

// Fallback analysis when AI is unavailable
function getFallbackAnalysis(title: string, description: string, location?: string) {
  const text = (title + ' ' + description).toLowerCase();
  
  // Simple keyword-based categorization
  let category = 'General';
  let department = 'General Services';
  let priority = 3;
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  if (text.includes('road') || text.includes('street') || text.includes('pothole')) {
    category = 'Infrastructure';
    department = 'Public Works';
  } else if (text.includes('water') || text.includes('sewer') || text.includes('drainage')) {
    category = 'Utilities';
    department = 'Water & Sewer';
  } else if (text.includes('police') || text.includes('crime') || text.includes('safety')) {
    category = 'Public Safety';
    department = 'Police Department';
    priority = 4;
    urgency = 'high';
  } else if (text.includes('fire') || text.includes('emergency')) {
    category = 'Emergency';
    department = 'Fire Department';
    priority = 5;
    urgency = 'critical';
  } else if (text.includes('park') || text.includes('recreation')) {
    category = 'Parks & Recreation';
    department = 'Parks Department';
  }
  
  return {
    category,
    subcategory: undefined,
    priority,
    urgency,
    sentiment: 'neutral' as const,
    department,
    estimatedResolutionDays: 7,
    isEmergency: priority >= 5,
    confidence: 60,
    tags: [category.toLowerCase()],
    summary: `${category} complaint requiring attention`
  };
}
