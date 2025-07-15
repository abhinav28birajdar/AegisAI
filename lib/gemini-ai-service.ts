// Enhanced Gemini AI Service with comprehensive CivicChain features
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// AI Analysis Types
export interface ComplaintClassification {
  category: string
  subcategory: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency'
  urgency_level: 'low' | 'medium' | 'high' | 'critical' | 'emergency'
  estimated_resolution_days: number
  required_department: string
  resource_suggestions: string[]
  similar_cases: string[]
  reasoning: string
}

export interface MediaAnalysis {
  description: string
  detected_issues: string[]
  location_context: string
  safety_concerns: string[]
  evidence_quality: 'poor' | 'fair' | 'good' | 'excellent'
  contains_sensitive_info: boolean
  recommended_actions: string[]
}

export interface PredictiveInsight {
  insight_type: string
  prediction: string
  confidence_level: number
  risk_score: number
  recommended_actions: string[]
  estimated_impact: {
    cost: number
    affected_citizens: number
    severity: string
  }
  time_horizon: string
}

export interface ChatbotResponse {
  message: string
  intent: string
  confidence: number
  suggested_actions?: string[]
  related_complaints?: string[]
  escalation_needed: boolean
}

export interface ProposalAnalysis {
  feasibility_score: number
  impact_analysis: {
    economic: string
    social: string
    environmental: string
  }
  risk_assessment: string[]
  cost_estimate: {
    min: number
    max: number
    currency: string
  }
  implementation_timeline: string
  success_probability: number
}

class GeminiAIService {
  private model: any
  private visionModel: any
  private fallbackEnabled = true

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    this.visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision-latest' })
  }

  // Comprehensive complaint classification
  async classifyComplaint(description: string, location?: string, mediaAnalysis?: MediaAnalysis): Promise<ComplaintClassification> {
    try {
      const prompt = `
As a civic AI assistant, analyze this citizen complaint and provide comprehensive classification:

Complaint Description: "${description}"
${location ? `Location: ${location}` : ''}
${mediaAnalysis ? `Media Analysis: ${JSON.stringify(mediaAnalysis)}` : ''}

Please provide a detailed analysis in the following JSON format:
{
  "category": "Infrastructure|Public Safety|Environment|Transportation|Utilities|Housing|Health|Education|Other",
  "subcategory": "specific subcategory",
  "confidence": 0.0-1.0,
  "severity": "low|medium|high|critical|emergency",
  "urgency_level": "low|medium|high|critical|emergency",
  "estimated_resolution_days": number,
  "required_department": "department name",
  "resource_suggestions": ["resource1", "resource2"],
  "similar_cases": ["case description 1", "case description 2"],
  "reasoning": "detailed explanation of classification"
}

Consider factors like:
- Public safety implications
- Infrastructure impact
- Environmental concerns
- Resource requirements
- Legal/regulatory aspects
- Community impact
- Cost implications
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const classification = JSON.parse(jsonMatch[0])
        return classification
      }

      // Fallback classification
      return this.getFallbackClassification(description)

    } catch (error) {
      console.error('Gemini classification error:', error)
      if (this.fallbackEnabled) {
        return this.getFallbackClassification(description)
      }
      throw error
    }
  }

  // Enhanced media analysis with Gemini Vision
  async analyzeMedia(imageData: string, description?: string): Promise<MediaAnalysis> {
    try {
      const prompt = `
Analyze this image in the context of a civic complaint. Provide detailed analysis in JSON format:

${description ? `Complaint Context: ${description}` : ''}

Please analyze and respond with:
{
  "description": "detailed description of what you see",
  "detected_issues": ["issue1", "issue2"],
  "location_context": "urban/suburban/rural and other location details",
  "safety_concerns": ["concern1", "concern2"],
  "evidence_quality": "poor|fair|good|excellent",
  "contains_sensitive_info": boolean,
  "recommended_actions": ["action1", "action2"]
}

Focus on:
- Infrastructure damage or defects
- Safety hazards
- Environmental issues
- Code violations
- Accessibility problems
- Evidence quality for complaint processing
`

      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: 'image/jpeg'
        }
      }

      const result = await this.visionModel.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return this.getFallbackMediaAnalysis()

    } catch (error) {
      console.error('Gemini vision analysis error:', error)
      return this.getFallbackMediaAnalysis()
    }
  }

  // Predictive analytics for city management
  async generatePredictiveInsights(historicalData: any[], dataType: string): Promise<PredictiveInsight[]> {
    try {
      const prompt = `
As a predictive analytics AI for city management, analyze this historical data and generate actionable insights:

Data Type: ${dataType}
Historical Data: ${JSON.stringify(historicalData.slice(-50))} // Last 50 records

Generate 3-5 predictive insights in JSON array format:
[
  {
    "insight_type": "infrastructure_risk|budget_forecast|resource_optimization|maintenance_prediction|safety_alert",
    "prediction": "specific prediction statement",
    "confidence_level": 0.0-1.0,
    "risk_score": 0.0-1.0,
    "recommended_actions": ["action1", "action2"],
    "estimated_impact": {
      "cost": estimated_cost_usd,
      "affected_citizens": number,
      "severity": "low|medium|high|critical"
    },
    "time_horizon": "1_week|1_month|3_months|1_year"
  }
]

Focus on:
- Trend analysis and pattern recognition
- Risk assessment and early warning
- Resource optimization opportunities
- Budget planning insights
- Preventive maintenance scheduling
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return []

    } catch (error) {
      console.error('Predictive insights error:', error)
      return []
    }
  }

  // AI-powered chatbot for citizen assistance
  async processChatbotQuery(message: string, context?: any): Promise<ChatbotResponse> {
    try {
      const prompt = `
You are CivicBot, an AI assistant for CivicChain - a civic engagement platform. Help citizens with their queries.

User Message: "${message}"
${context ? `Context: ${JSON.stringify(context)}` : ''}

Respond in JSON format:
{
  "message": "helpful response to the user",
  "intent": "complaint_status|how_to_report|general_info|dao_voting|token_balance|other",
  "confidence": 0.0-1.0,
  "suggested_actions": ["action1", "action2"],
  "related_complaints": ["complaint_id1", "complaint_id2"],
  "escalation_needed": boolean
}

Be helpful, concise, and encourage civic participation. If you don't know something, be honest and suggest alternatives.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        message: "I'm here to help with your civic questions. Could you please rephrase that?",
        intent: "general_info",
        confidence: 0.5,
        escalation_needed: false
      }

    } catch (error) {
      console.error('Chatbot error:', error)
      return {
        message: "I'm experiencing technical difficulties. Please try again or contact support.",
        intent: "other",
        confidence: 0.1,
        escalation_needed: true
      }
    }
  }

  // DAO proposal analysis
  async analyzeDAOProposal(proposalText: string, category: string): Promise<ProposalAnalysis> {
    try {
      const prompt = `
Analyze this DAO proposal for a civic governance platform:

Proposal: "${proposalText}"
Category: ${category}

Provide comprehensive analysis in JSON format:
{
  "feasibility_score": 0.0-1.0,
  "impact_analysis": {
    "economic": "detailed economic impact analysis",
    "social": "social impact assessment",
    "environmental": "environmental considerations"
  },
  "risk_assessment": ["risk1", "risk2", "risk3"],
  "cost_estimate": {
    "min": minimum_cost_usd,
    "max": maximum_cost_usd,
    "currency": "USD"
  },
  "implementation_timeline": "estimated timeline",
  "success_probability": 0.0-1.0
}

Consider:
- Technical feasibility
- Budget requirements
- Community impact
- Implementation complexity
- Regulatory compliance
- Long-term sustainability
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return this.getFallbackProposalAnalysis()

    } catch (error) {
      console.error('Proposal analysis error:', error)
      return this.getFallbackProposalAnalysis()
    }
  }

  // Sentiment analysis for community feedback
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    emotions: string[]
    toxicity_score: number
    helpfulness_score: number
  }> {
    try {
      const prompt = `
Analyze the sentiment and quality of this community feedback:

Text: "${text}"

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "emotions": ["emotion1", "emotion2"],
  "toxicity_score": 0.0-1.0,
  "helpfulness_score": 0.0-1.0
}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
        toxicity_score: 0,
        helpfulness_score: 0.5
      }

    } catch (error) {
      console.error('Sentiment analysis error:', error)
      return {
        sentiment: 'neutral',
        confidence: 0.1,
        emotions: [],
        toxicity_score: 0,
        helpfulness_score: 0.1
      }
    }
  }

  // Resource optimization recommendations
  async optimizeResources(currentResources: any[], workload: any[]): Promise<{
    recommendations: string[]
    efficiency_score: number
    cost_savings: number
    improved_response_time: number
  }> {
    try {
      const prompt = `
Analyze current resource allocation and workload to provide optimization recommendations:

Current Resources: ${JSON.stringify(currentResources)}
Current Workload: ${JSON.stringify(workload)}

Provide optimization recommendations in JSON format:
{
  "recommendations": ["recommendation1", "recommendation2"],
  "efficiency_score": 0.0-1.0,
  "cost_savings": estimated_annual_savings_usd,
  "improved_response_time": percentage_improvement
}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        recommendations: ["Continue monitoring current allocation"],
        efficiency_score: 0.7,
        cost_savings: 0,
        improved_response_time: 0
      }

    } catch (error) {
      console.error('Resource optimization error:', error)
      return {
        recommendations: ["Unable to analyze at this time"],
        efficiency_score: 0.5,
        cost_savings: 0,
        improved_response_time: 0
      }
    }
  }

  // Fallback methods
  private getFallbackClassification(description: string): ComplaintClassification {
    const keywords = description.toLowerCase()
    
    let category = 'Other'
    let department = 'General Services'
    
    if (keywords.includes('road') || keywords.includes('pothole') || keywords.includes('street')) {
      category = 'Infrastructure'
      department = 'Public Works'
    } else if (keywords.includes('water') || keywords.includes('sewer') || keywords.includes('utility')) {
      category = 'Utilities'
      department = 'Water & Utilities'
    } else if (keywords.includes('safety') || keywords.includes('crime') || keywords.includes('emergency')) {
      category = 'Public Safety'
      department = 'Public Safety'
    }

    return {
      category,
      subcategory: 'General',
      confidence: 0.6,
      severity: 'medium',
      urgency_level: 'medium',
      estimated_resolution_days: 7,
      required_department: department,
      resource_suggestions: ['Standard inspection', 'Field assessment'],
      similar_cases: [],
      reasoning: 'Automated classification based on keyword analysis'
    }
  }

  private getFallbackMediaAnalysis(): MediaAnalysis {
    return {
      description: 'Image uploaded successfully',
      detected_issues: ['Requires manual review'],
      location_context: 'Urban area',
      safety_concerns: [],
      evidence_quality: 'fair',
      contains_sensitive_info: false,
      recommended_actions: ['Manual review recommended']
    }
  }

  private getFallbackProposalAnalysis(): ProposalAnalysis {
    return {
      feasibility_score: 0.7,
      impact_analysis: {
        economic: 'Requires detailed economic assessment',
        social: 'Potential positive community impact',
        environmental: 'Environmental impact to be determined'
      },
      risk_assessment: ['Implementation complexity', 'Budget requirements'],
      cost_estimate: {
        min: 10000,
        max: 50000,
        currency: 'USD'
      },
      implementation_timeline: '6-12 months',
      success_probability: 0.6
    }
  }
}

export const geminiAI = new GeminiAIService()
export default geminiAI
