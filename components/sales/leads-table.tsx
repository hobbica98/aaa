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
import { Lead, LEAD_STATUSES } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react"

interface LeadsTableProps {
  leads: Lead[]
  allLeads: Lead[]
}

type SortField = "companyName" | "estimatedValue" | "createdAt" | "status"
type SortDirection = "asc" | "desc"

export function LeadsTable({ leads }: LeadsTableProps) {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.companyName.toLowerCase().includes(searchLower) ||
          lead.contactName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "companyName":
          comparison = a.companyName.localeCompare(b.companyName)
          break
        case "estimatedValue":
          comparison = a.estimatedValue - b.estimatedValue
          break
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "status":
          const statusOrder = LEAD_STATUSES.map((s) => s.value)
          comparison =
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [leads, search, sortField, sortDirection])

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedLeads.slice(start, start + pageSize)
  }, [filteredAndSortedLeads, page])

  const totalPages = Math.ceil(filteredAndSortedLeads.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getStatusBadge = (status: Lead["status"]) => {
    const statusConfig = LEAD_STATUSES.find((s) => s.value === status)
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
        <CardTitle className="text-base">Leads</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
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
                  onClick={() => handleSort("companyName")}
                >
                  <div className="flex items-center gap-1">
                    Company
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
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
                  onClick={() => handleSort("estimatedValue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Source</TableHead>
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
              {paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {lead.companyName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.contactName}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${lead.estimatedValue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filteredAndSortedLeads.length)} of{" "}
            {filteredAndSortedLeads.length} leads
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
