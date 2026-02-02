export interface Project {
  id: string
  title: string
  value: number
  description: string
  tag: string
  estimatedHours: number
  attachedFile?: File | null
  icon?: string
  teamId?: string
  status: "pending" | "assigned" | "in-progress" | "completed"
  createdAt: Date
}

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost"

export type QuoteStatus = 
  | "discoveryMeeting" 
  | "technicalValidation" 
  | "economicValidation" 
  | "proposalDevelopment" 
  | "proposalPresentation" 
  | "negotiation" 
  | "finalApproval" 
  | "closedWon" 
  | "closedLost" 
  | "orderCreated"

export interface Lead {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  source: string
  status: LeadStatus
  estimatedValue: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Quote {
  id: string
  leadId: string
  quoteNumber: string
  quoteCode: string
  title: string
  description?: string
  price: number
  cost: number
  estimatedValue: number
  expirationDate: Date
  status: QuoteStatus
  customer?: {
    id?: string
    businessName?: string
    name?: string
  }
  assignedEmployee?: {
    id?: string
    name?: string
  }
  percentageOfWeight: number
  inStandBy: boolean
  createdAt: Date
  updatedAt: Date
}

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "#3b82f6" },
  { value: "contacted", label: "Contacted", color: "#8b5cf6" },
  { value: "qualified", label: "Qualified", color: "#06b6d4" },
  { value: "proposal", label: "Proposal", color: "#f59e0b" },
  { value: "negotiation", label: "Negotiation", color: "#ec4899" },
  { value: "won", label: "Won", color: "#10b981" },
  { value: "lost", label: "Lost", color: "#ef4444" },
]

export const QUOTE_STATUSES: { value: QuoteStatus; label: string; color: string; percentage: number }[] = [
  { value: "discoveryMeeting", label: "Discovery Meeting", color: "#3b82f6", percentage: 25 },
  { value: "technicalValidation", label: "Technical Validation", color: "#8b5cf6", percentage: 40 },
  { value: "economicValidation", label: "Economic Validation", color: "#06b6d4", percentage: 60 },
  { value: "proposalDevelopment", label: "Proposal Development", color: "#f59e0b", percentage: 70 },
  { value: "proposalPresentation", label: "Proposal Presentation", color: "#ec4899", percentage: 80 },
  { value: "negotiation", label: "Negotiation", color: "#a855f7", percentage: 90 },
  { value: "finalApproval", label: "Final Approval", color: "#84cc16", percentage: 95 },
  { value: "closedWon", label: "Closed Won", color: "#10b981", percentage: 100 },
  { value: "closedLost", label: "Closed Lost", color: "#ef4444", percentage: 0 },
  { value: "orderCreated", label: "Order Created", color: "#14b8a6", percentage: 100 },
]

export interface Team {
  id: string
  name: string
  color: string
  memberCount: number
}

export const TEAMS: Team[] = [
  { id: "team-1", name: "Development Team", color: "#3b82f6", memberCount: 8 },
  { id: "team-2", name: "Design Team", color: "#8b5cf6", memberCount: 5 },
  { id: "team-3", name: "Marketing Team", color: "#10b981", memberCount: 6 },
  { id: "team-4", name: "Operations Team", color: "#f59e0b", memberCount: 7 },
]
