import type { Lead, Quote, LeadStatus, QuoteStatus } from "./types"

const API_BASE_URL = "https://zenithar-abacus-sales.prod.aws.r-s.cloud"

// Get auth token from localStorage - same token used by the rest of the app
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || null
  }
  return null
}

// Transform API response to our Lead type
function transformLead(apiLead: any, index: number): Lead {
  // Log first few leads to see actual field names
  if (index < 3) {
    console.log("[v0] Lead object keys:", Object.keys(apiLead))
    console.log("[v0] Lead sample data:", JSON.stringify(apiLead, null, 2))
  }

  return {
    id: apiLead.id?.toString() || apiLead._id || "",
    companyName: apiLead.companyName || apiLead.company_name || apiLead.company || apiLead.organization || "",
    contactName: apiLead.contactName || apiLead.contact_name || apiLead.name || apiLead.fullName || "",
    email: apiLead.email || apiLead.emailAddress || "",
    phone: apiLead.phone || apiLead.telephone || apiLead.phoneNumber || "",
    source: apiLead.source || apiLead.leadSource || apiLead.origin || "Unknown",
    status: normalizeLeadStatus(apiLead.status || apiLead.state),
    estimatedValue: Number(apiLead.estimatedValue || apiLead.estimated_value || apiLead.value || apiLead.amount || 0),
    notes: apiLead.notes || apiLead.description || apiLead.memo || "",
    createdAt: new Date(apiLead.createdAt || apiLead.created_at || apiLead.createDate || apiLead.dateCreated || new Date()),
    updatedAt: new Date(apiLead.updatedAt || apiLead.updated_at || apiLead.updateDate || apiLead.dateUpdated || new Date()),
  }
}

// Helper to safely extract string value from potentially nested objects
function safeString(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    // Try common string fields
    return value.name || value.businessName || value.title || value.label || value._id || ""
  }
  return ""
}

// Transform API response to our Quote type based on actual schema
function transformQuote(apiQuote: any, index: number): Quote {
  // Log first few quotes to see actual field names
  if (index < 3) {
    console.log("[v0] Quote object keys:", Object.keys(apiQuote))
    console.log("[v0] Quote sample data:", JSON.stringify(apiQuote, null, 2))
  }

  // Extract customer info - handle both object and primitive cases
  const customer = apiQuote.customer || {}
  const account = apiQuote.account || {}
  
  // Safely extract customer business name
  const customerBusinessName = typeof customer === 'object' 
    ? safeString(customer.businessName) || safeString(customer.name) 
    : safeString(customer)
  
  const customerName = typeof customer === 'object'
    ? safeString(customer.name) || safeString(customer.businessName)
    : safeString(customer)
    
  const customerId = typeof customer === 'object'
    ? safeString(customer._id) || safeString(customer.id)
    : ""

  // Safely extract account/employee name
  const employeeName = typeof account === 'object'
    ? safeString(account.name) || safeString(account.fullName)
    : safeString(account)
    
  const employeeId = typeof account === 'object'
    ? safeString(account._id) || safeString(account.id)
    : ""

  return {
    id: safeString(apiQuote._id) || safeString(apiQuote.id) || "",
    leadId: safeString(apiQuote.leadId) || safeString(apiQuote.lead?._id) || "",
    quoteNumber: safeString(apiQuote.quoteNumber) || "",
    quoteCode: safeString(apiQuote.quoteCode) || "",
    title: safeString(apiQuote.title) || "",
    description: safeString(apiQuote.description) || safeString(apiQuote.notes) || "",
    price: Number(apiQuote.price || 0),
    cost: Number(apiQuote.cost || 0),
    estimatedValue: Number(apiQuote.estimatedValue || 0),
    expirationDate: apiQuote.expirationDate ? new Date(apiQuote.expirationDate) : new Date(),
    status: apiQuote.status as QuoteStatus || "discoveryMeeting",
    customer: {
      id: customerId,
      businessName: customerBusinessName,
      name: customerName,
    },
    assignedEmployee: {
      id: employeeId,
      name: employeeName,
    },
    percentageOfWeight: Number(apiQuote.percentageOfWeight || 0),
    inStandBy: Boolean(apiQuote.inStandBy),
    createdAt: new Date(apiQuote.createdAt || new Date()),
    updatedAt: new Date(apiQuote.updatedAt || new Date()),
  }
}

// Normalize various status strings to our LeadStatus type
function normalizeLeadStatus(status: string | undefined): LeadStatus {
  if (!status) return "new"
  
  const normalized = status.toLowerCase().trim()
  
  const statusMap: Record<string, LeadStatus> = {
    "new": "new",
    "contacted": "contacted",
    "contact": "contacted",
    "qualified": "qualified",
    "qualify": "qualified",
    "proposal": "proposal",
    "negotiation": "negotiation",
    "negotiating": "negotiation",
    "won": "won",
    "closed-won": "won",
    "closed_won": "won",
    "lost": "lost",
    "closed-lost": "lost",
    "closed_lost": "lost",
  }
  
  return statusMap[normalized] || "new"
}

// Valid quote statuses from the API
const VALID_QUOTE_STATUSES: QuoteStatus[] = [
  "discoveryMeeting",
  "technicalValidation", 
  "economicValidation",
  "proposalDevelopment",
  "proposalPresentation",
  "negotiation",
  "finalApproval",
  "closedWon",
  "closedLost",
  "orderCreated",
]

// Normalize quote status - the API already uses the correct enum values
function normalizeQuoteStatus(status: string | undefined): QuoteStatus {
  if (!status) return "discoveryMeeting"
  
  if (VALID_QUOTE_STATUSES.includes(status as QuoteStatus)) {
    return status as QuoteStatus
  }
  
  return "discoveryMeeting"
}

export async function fetchLeads(): Promise<Lead[]> {
  try {
    const token = getAuthToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/leads`, {
      cache: "no-store",
      headers,
    })
    
    if (!response.ok) {
      console.log("[v0] Leads API response not ok:", response.status, response.statusText)
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("[v0] Leads API raw response:", JSON.stringify(data).slice(0, 500))
    
    // Handle different response formats
    const leadsArray = Array.isArray(data) ? data : (data.leads || data.data || data.results || [])
    
    return leadsArray.map((lead: any, index: number) => transformLead(lead, index))
  } catch (error) {
    console.log("[v0] Error fetching leads:", error)
    throw error
  }
}

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const token = getAuthToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/quotes`, {
      cache: "no-store",
      headers,
    })
    
    if (!response.ok) {
      console.log("[v0] Quotes API response not ok:", response.status, response.statusText)
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("[v0] Quotes API raw response:", JSON.stringify(data).slice(0, 500))
    
    // Handle different response formats
    const quotesArray = Array.isArray(data) ? data : (data.quotes || data.data || data.results || [])
    
    return quotesArray.map((quote: any, index: number) => transformQuote(quote, index))
  } catch (error) {
    console.log("[v0] Error fetching quotes:", error)
    throw error
  }
}

export async function fetchSalesData(): Promise<{ leads: Lead[]; quotes: Quote[] }> {
  const [leads, quotes] = await Promise.all([
    fetchLeads(),
    fetchQuotes(),
  ])
  
  return { leads, quotes }
}
