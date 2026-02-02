"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { LEAD_STATUSES, QUOTE_STATUSES, LeadStatus, QuoteStatus } from "@/lib/types"
import type { SalesFiltersState } from "@/app/sales/page"

interface SalesFiltersProps {
  filters: SalesFiltersState
  onFiltersChange: (filters: SalesFiltersState) => void
}

export function SalesFilters({ filters, onFiltersChange }: SalesFiltersProps) {
  const toggleLeadStatus = (status: LeadStatus) => {
    const newStatuses = filters.leadStatuses.includes(status)
      ? filters.leadStatuses.filter((s) => s !== status)
      : [...filters.leadStatuses, status]
    onFiltersChange({ ...filters, leadStatuses: newStatuses })
  }

  const toggleQuoteStatus = (status: QuoteStatus) => {
    const newStatuses = filters.quoteStatuses.includes(status)
      ? filters.quoteStatuses.filter((s) => s !== status)
      : [...filters.quoteStatuses, status]
    onFiltersChange({ ...filters, quoteStatuses: newStatuses })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      leadStatuses: [],
      quoteStatuses: [],
    })
  }

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.leadStatuses.length > 0 ||
    filters.quoteStatuses.length > 0

  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Date Range
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-background/50",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) =>
                      onFiltersChange({
                        ...filters,
                        dateRange: { from: range?.from, to: range?.to },
                      })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Lead Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Lead Status
            </span>
            {LEAD_STATUSES.map((status) => (
              <Badge
                key={status.value}
                variant={
                  filters.leadStatuses.includes(status.value)
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  filters.leadStatuses.includes(status.value)
                    ? "border-transparent"
                    : "bg-background/50 hover:bg-muted"
                )}
                style={{
                  backgroundColor: filters.leadStatuses.includes(status.value)
                    ? status.color
                    : undefined,
                  color: filters.leadStatuses.includes(status.value)
                    ? "#fff"
                    : undefined,
                  borderColor: !filters.leadStatuses.includes(status.value)
                    ? status.color
                    : undefined,
                }}
                onClick={() => toggleLeadStatus(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>

          {/* Quote Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              Quote Status
            </span>
            {QUOTE_STATUSES.map((status) => (
              <Badge
                key={status.value}
                variant={
                  filters.quoteStatuses.includes(status.value)
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  filters.quoteStatuses.includes(status.value)
                    ? "border-transparent"
                    : "bg-background/50 hover:bg-muted"
                )}
                style={{
                  backgroundColor: filters.quoteStatuses.includes(status.value)
                    ? status.color
                    : undefined,
                  color: filters.quoteStatuses.includes(status.value)
                    ? "#fff"
                    : undefined,
                  borderColor: !filters.quoteStatuses.includes(status.value)
                    ? status.color
                    : undefined,
                }}
                onClick={() => toggleQuoteStatus(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
