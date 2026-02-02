"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Quote, Lead, QUOTE_STATUSES } from "@/lib/types"
import { format, formatDistanceToNow, isPast } from "date-fns"
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
} from "lucide-react"

interface QuotesTableProps {
  quotes: Quote[]
  leads: Lead[]
}

type SortField = "quoteNumber" | "price" | "createdAt" | "expirationDate" | "status" | "estimatedValue"
type SortDirection = "asc" | "desc"

export function QuotesTable({ quotes, leads }: QuotesTableProps) {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const getClientName = (quote: Quote) => {
    // First try customer businessName, then title, then lead
    if (quote.customer?.businessName) return quote.customer.businessName
    if (quote.customer?.name) return quote.customer.name
    if (quote.title) return quote.title
    const lead = leads.find((l) => l.id === quote.leadId)
    return lead?.companyName || "Unknown"
  }

  const filteredAndSortedQuotes = useMemo(() => {
    let result = [...quotes]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (quote) =>
          quote.quoteNumber?.toLowerCase().includes(searchLower) ||
          quote.quoteCode?.toLowerCase().includes(searchLower) ||
          quote.title?.toLowerCase().includes(searchLower) ||
          getClientName(quote).toLowerCase().includes(searchLower)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "quoteNumber":
          comparison = (a.quoteNumber || "").localeCompare(b.quoteNumber || "")
          break
        case "price":
          comparison = (a.price || 0) - (b.price || 0)
          break
        case "estimatedValue":
          comparison = (a.estimatedValue || 0) - (b.estimatedValue || 0)
          break
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "expirationDate":
          comparison =
            new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
          break
        case "status":
          const statusOrder = QUOTE_STATUSES.map((s) => s.value)
          comparison =
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [quotes, search, sortField, sortDirection, leads])

  const paginatedQuotes = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedQuotes.slice(start, start + pageSize)
  }, [filteredAndSortedQuotes, page])

  const totalPages = Math.ceil(filteredAndSortedQuotes.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getStatusBadge = (status: Quote["status"]) => {
    const statusConfig = QUOTE_STATUSES.find((s) => s.value === status)
    return (
      <Badge
        variant="outline"
        style={{
          backgroundColor: `${statusConfig?.color}20`,
          borderColor: statusConfig?.color,
          color: statusConfig?.color,
        }}
      >
        {statusConfig?.label}
      </Badge>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Quotes</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8 bg-background/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("quoteNumber")}
                >
                  <div className="flex items-center gap-1">
                    Quote #
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Price
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("estimatedValue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Est. Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("expirationDate")}
                >
                  <div className="flex items-center gap-1">
                    Expiration
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    Created
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuotes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No quotes found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQuotes.map((quote) => {
                  const isExpired =
                    quote.expirationDate && isPast(new Date(quote.expirationDate)) &&
                    !["closedWon", "closedLost", "orderCreated"].includes(quote.status)
                  return (
                    <TableRow key={quote.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium font-mono">
                        {quote.quoteCode || quote.quoteNumber || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {getClientName(quote)}
                          </span>
                          {quote.title && quote.title !== getClientName(quote) && (
                            <span className="text-xs text-muted-foreground">
                              {quote.title}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(quote.status)}
                          {quote.inStandBy && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                              Stand By
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {quote.price > 0 ? `€${quote.price.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {quote.estimatedValue > 0 ? `€${quote.estimatedValue.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        {quote.expirationDate ? (
                          <div className="flex items-center gap-1">
                            {isExpired && (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={
                                isExpired
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }
                            >
                              {format(new Date(quote.expirationDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(quote.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredAndSortedQuotes.length)} of{" "}
            {filteredAndSortedQuotes.length} quotes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
