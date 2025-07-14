import { v4 as uuidv4 } from "uuid"

export const generateMockTxHash = () =>
  `0x${uuidv4().replace(/-/g, "").slice(0, 32)}${uuidv4().replace(/-/g, "").slice(0, 32)}`

export const generateMockCarvAttestationId = () => `carv_att_${uuidv4()}`

// Enhanced AI categorization with Web3 and multi-agent features
export const mockAICategorization = (description: string, imageUrls?: string[]) => {
  const desc = description.toLowerCase()
  let result = {
    issue_type_ai: "General Complaint",
    urgency_ai: "Low",
    category: "general",
    subcategory: "other",
    priority: "low" as "low" | "medium" | "high" | "urgent",
    confidence: 0.7,
    suggestedDepartment: "General Services",
    estimatedResolutionTime: "5-7 days",
    tags: [] as string[],
    blockchainReady: true,
    carvAttestationEligible: true
  }

  // Road/Infrastructure issues
  if (desc.includes("pothole") || desc.includes("road damage") || desc.includes("street") || desc.includes("pavement")) {
    result = {
      ...result,
      issue_type_ai: "Road Infrastructure",
      urgency_ai: "High",
      category: "infrastructure",
      subcategory: "road_maintenance", 
      priority: "high",
      confidence: 0.9,
      suggestedDepartment: "Roads & Transportation",
      estimatedResolutionTime: "2-4 days",
      tags: ["roads", "infrastructure", "maintenance"]
    }
  }
  // Waste Management
  else if (desc.includes("garbage") || desc.includes("waste") || desc.includes("trash") || desc.includes("litter")) {
    result = {
      ...result,
      issue_type_ai: "Waste Management",
      urgency_ai: "Medium",
      category: "sanitation",
      subcategory: "waste_collection",
      priority: "medium",
      confidence: 0.85,
      suggestedDepartment: "Sanitation Department", 
      estimatedResolutionTime: "1-2 days",
      tags: ["waste", "sanitation", "cleanliness"]
    }
  }
  // Water Infrastructure
  else if (desc.includes("water") || desc.includes("leak") || desc.includes("pipe") || desc.includes("flooding")) {
    result = {
      ...result,
      issue_type_ai: "Water Infrastructure",
      urgency_ai: "High", 
      category: "utilities",
      subcategory: "water_supply",
      priority: "high",
      confidence: 0.9,
      suggestedDepartment: "Water Department",
      estimatedResolutionTime: "1-3 days",
      tags: ["water", "utilities", "infrastructure"]
    }
  }
  // Street Lighting
  else if (desc.includes("light") || desc.includes("lamp") || desc.includes("dark") || desc.includes("electricity")) {
    result = {
      ...result,
      issue_type_ai: "Street Lighting",
      urgency_ai: "Medium",
      category: "utilities", 
      subcategory: "electrical",
      priority: "medium",
      confidence: 0.8,
      suggestedDepartment: "Electrical Department",
      estimatedResolutionTime: "2-3 days", 
      tags: ["lighting", "electricity", "safety"]
    }
  }
  // Noise Complaints
  else if (desc.includes("noise") || desc.includes("loud") || desc.includes("sound")) {
    result = {
      ...result,
      issue_type_ai: "Noise Complaint",
      urgency_ai: "Low",
      category: "public_order",
      subcategory: "noise_control", 
      priority: "low",
      confidence: 0.75,
      suggestedDepartment: "Public Safety",
      estimatedResolutionTime: "3-5 days",
      tags: ["noise", "public_order", "quality_of_life"]
    }
  }

  // Emergency escalation keywords
  if (desc.includes("emergency") || desc.includes("urgent") || desc.includes("immediate") || desc.includes("dangerous")) {
    result.priority = "urgent"
    result.urgency_ai = "Critical"
    result.estimatedResolutionTime = "0-24 hours"
    result.tags.push("emergency")
  }

  // Add image analysis simulation
  if (imageUrls && imageUrls.length > 0) {
    result.confidence = Math.min(0.95, result.confidence + 0.1)
    result.tags.push("image_verified")
  }

  return result
}
