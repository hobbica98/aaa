"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SalesOverview } from "@/components/sales/sales-overview"
import { SalesFilters } from "@/components/sales/sales-filters"
import { LeadsTable } from "@/components/sales/leads-table"
import { QuotesTable } from "@/components/sales/quotes-table"
import { Lead, Quote, LeadStatus, QuoteStatus } from "@/lib/types"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useSWR from "swr"
import { fetchLeads, fetchQuotes } from "@/lib/api-service"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SalesFiltersState {
  dateRange: { from: Date | undefined; to: Date | undefined }
  leadStatuses: LeadStatus[]
  quoteStatuses: QuoteStatus[]
}

export default function SalesPage() {
  const [filters, setFilters] = useState<SalesFiltersState>({
    dateRange: { from: undefined, to: undefined },
    leadStatuses: [],
    quoteStatuses: [],
  })

  const { 
    data: leads = [], 
    error: leadsError, 
    isLoading: leadsLoading,
    mutate: mutateLeads 
  } = useSWR<Lead[]>("leads", fetchLeads, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const { 
    data: quotes = [], 
    error: quotesError, 
    isLoading: quotesLoading,
    mutate: mutateQuotes 
  } = useSWR<Quote[]>("quotes", fetchQuotes, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const isLoading = leadsLoading || quotesLoading
  const hasError = leadsError || quotesError

  const handleRefresh = () => {
    mutateLeads()
    mutateQuotes()
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Date filter
      if (filters.dateRange.from && new Date(lead.createdAt) < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to && new Date(lead.createdAt) > filters.dateRange.to) {
        return false
      }
      // Status filter
      if (filters.leadStatuses.length > 0 && !filters.leadStatuses.includes(lead.status)) {
        return false
      }
      return true
    })
  }, [leads, filters])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // Date filter
      if (filters.dateRange.from && new Date(quote.createdAt) < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to && new Date(quote.createdAt) > filters.dateRange.to) {
        return false
      }
      // Status filter
      if (filters.quoteStatuses.length > 0 && !filters.quoteStatuses.includes(quote.status)) {
        return false
      }
      return true
    })
  }, [quotes, filters])

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading sales data...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (hasError) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-medium">Failed to load sales data</p>
                <p className="text-sm text-muted-foreground">
                  {leadsError?.message || quotesError?.message || "Unknown error"}
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sales Dashboard</h1>
              <p className="text-muted-foreground">
                Track leads and quotes performance
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <SalesFilters filters={filters} onFiltersChange={setFilters} />

          <SalesOverview leads={filteredLeads} quotes={filteredQuotes} />

          <Tabs defaultValue="leads" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="leads">
                Leads ({filteredLeads.length})
              </TabsTrigger>
              <TabsTrigger value="quotes">
                Quotes ({filteredQuotes.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="leads" className="space-y-4">
              <LeadsTable leads={filteredLeads} allLeads={leads} />
            </TabsContent>
            <TabsContent value="quotes" className="space-y-4">
              <QuotesTable quotes={filteredQuotes} leads={leads} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
