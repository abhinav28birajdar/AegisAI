// Google Gemini AI Integration for AegisAI Platform
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD9TEzZQt5PubJDfwUUWV7BoOiWCS9cKaQ';

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not found. AI features will use mock data.');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Complaint categorization model
const categorizationModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Emergency detection model
const emergencyModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface ComplaintAnalysis {
  category: string;
  subcategory?: string;
  priority: number; // 1-5 scale
  urgency: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative' | 'angry' | 'frustrated';
  department: string;
  estimatedResolutionDays: number;
  isEmergency: boolean;
  confidence: number;
  tags: string[];
  summary: string;
}

export async function analyzeComplaint(
  title: string, 
  description: string, 
  location?: string
): Promise<ComplaintAnalysis> {
  try {
    // Construct prompt for comprehensive analysis
    const analysisPrompt = `
Analyze this civic complaint and provide a comprehensive assessment:

Title: "${title}"
Description: "${description}"
Location: "${location || 'Not specified'}"

Please analyze and respond with a JSON object containing:
{
  "category": "primary category (Infrastructure, Public Safety, Environment, Transportation, etc.)",
  "subcategory": "specific subcategory",
  "priority": "1-5 numeric priority (5 = highest)",
  "urgency": "low/medium/high/critical",
  "sentiment": "positive/neutral/negative/angry/frustrated",
  "department": "responsible government department",
  "estimatedResolutionDays": "realistic number of days to resolve",
  "isEmergency": "true if requires immediate attention",
  "confidence": "0-100 confidence score",
  "tags": ["relevant", "tags", "for", "categorization"],
  "summary": "brief summary of the issue"
}

Focus on accuracy and provide realistic timelines. Consider the severity and complexity of the issue.`;

    const result = await categorizationModel.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response
    return {
      category: analysis.category || 'General',
      subcategory: analysis.subcategory,
      priority: Math.min(Math.max(analysis.priority || 3, 1), 5),
      urgency: ['low', 'medium', 'high', 'critical'].includes(analysis.urgency) 
        ? analysis.urgency 
        : 'medium',
      sentiment: ['positive', 'neutral', 'negative', 'angry', 'frustrated'].includes(analysis.sentiment)
        ? analysis.sentiment
        : 'neutral',
      department: analysis.department || 'General Services',
      estimatedResolutionDays: Math.max(analysis.estimatedResolutionDays || 7, 1),
      isEmergency: Boolean(analysis.isEmergency),
      confidence: Math.min(Math.max(analysis.confidence || 80, 0), 100),
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
      summary: analysis.summary || 'Civic complaint requiring attention'
    };
    
  } catch (error) {
    console.error('Gemini AI analysis failed:', error);
    
    // Return fallback analysis
    return getFallbackAnalysis(title, description);
  }
}

export async function detectEmergency(
  title: string, 
  description: string
): Promise<{
  isEmergency: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  recommendedActions: string[];
}> {
  try {
    const emergencyPrompt = `
Analyze this complaint for emergency status:

Title: "${title}"
Description: "${description}"

Respond with JSON:
{
  "isEmergency": "true if immediate danger/urgent response needed",
  "urgencyLevel": "low/medium/high/critical",
  "reasoning": "explanation of urgency assessment",
  "recommendedActions": ["immediate", "actions", "to", "take"]
}

Consider:
- Public safety threats
- Infrastructure failures
- Environmental hazards
- Time-sensitive issues`;

    const result = await emergencyModel.generateContent(emergencyPrompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid emergency detection response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      isEmergency: Boolean(analysis.isEmergency),
      urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(analysis.urgencyLevel)
        ? analysis.urgencyLevel
        : 'medium',
      reasoning: analysis.reasoning || 'Standard complaint processing',
      recommendedActions: Array.isArray(analysis.recommendedActions) 
        ? analysis.recommendedActions 
        : ['Route to appropriate department']
    };
    
  } catch (error) {
    console.error('Emergency detection failed:', error);
    
    return {
      isEmergency: false,
      urgencyLevel: 'medium',
      reasoning: 'Unable to assess emergency status',
      recommendedActions: ['Manual review required']
    };
  }
}

export async function generateResponseSuggestion(
  complaintTitle: string,
  complaintDescription: string,
  status: string
): Promise<string> {
  try {
    const responsePrompt = `
Generate a professional response for this civic complaint:

Complaint: "${complaintTitle}"
Description: "${complaintDescription}"
Current Status: "${status}"

Provide a helpful, empathetic response that:
- Acknowledges the citizen's concern
- Explains the current status
- Provides realistic next steps
- Maintains professional tone
- Shows accountability

Response:`;

    const result = await categorizationModel.generateContent(responsePrompt);
    const response = await result.response;
    
    return response.text().trim();
    
  } catch (error) {
    console.error('Response generation failed:', error);
    
    return `Thank you for your complaint regarding "${complaintTitle}". We have received your report and it is currently ${status}. We will review your concern and provide updates as progress is made. Your feedback is important to us and helps improve our community services.`;
  }
}

// Fallback analysis when AI is unavailable
function getFallbackAnalysis(title: string, description: string): ComplaintAnalysis {
  const text = (title + ' ' + description).toLowerCase();
  
  // Simple keyword-based categorization
  let category = 'General';
  let department = 'General Services';
  let priority = 3;
  
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
  } else if (text.includes('fire') || text.includes('emergency')) {
    category = 'Emergency';
    department = 'Fire Department';
    priority = 5;
  } else if (text.includes('park') || text.includes('recreation')) {
    category = 'Parks & Recreation';
    department = 'Parks Department';
  }
  
  return {
    category,
    priority,
    urgency: priority >= 4 ? 'high' : 'medium',
    sentiment: 'neutral',
    department,
    estimatedResolutionDays: 7,
    isEmergency: priority >= 5,
    confidence: 60,
    tags: [category.toLowerCase()],
    summary: `${category} complaint requiring attention`
  };
}

// Test function for development
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const result = await categorizationModel.generateContent('Test connection to Gemini AI. Respond with "Connected successfully"');
    const response = await result.response;
    const text = response.text();
    
    return text.toLowerCase().includes('connected');
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}
