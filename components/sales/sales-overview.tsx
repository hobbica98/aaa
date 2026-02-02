"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lead, Quote, LEAD_STATUSES, QUOTE_STATUSES } from "@/lib/types"
import { useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  PieChart,
  Pie,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SalesOverviewProps {
  leads: Lead[]
  quotes: Quote[]
}

export function SalesOverview({ leads, quotes }: SalesOverviewProps) {
  const stats = useMemo(() => {
    const totalLeads = leads.length
    const wonLeads = leads.filter((l) => l.status === "won").length
    const lostLeads = leads.filter((l) => l.status === "lost").length
    const activeLeads = totalLeads - wonLeads - lostLeads
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0

    const totalQuotes = quotes.length
    // Won quotes are closedWon or orderCreated
    const wonQuotes = quotes.filter((q) => 
      ["closedWon", "orderCreated"].includes(q.status)
    ).length
    // Active quotes are everything except closed states
    const activeQuotes = quotes.filter((q) =>
      !["closedWon", "closedLost", "orderCreated"].includes(q.status)
    ).length
    const quoteWinRate =
      totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0

    // Pipeline value from quotes (estimated value for active quotes)
    const totalPipelineValue = quotes
      .filter((q) => !["closedWon", "closedLost", "orderCreated"].includes(q.status))
      .reduce((sum, q) => sum + (q.estimatedValue || q.price || 0), 0)

    // Weighted pipeline value (estimatedWeightedValue or estimatedValue * percentage)
    const weightedPipelineValue = quotes
      .filter((q) => !["closedWon", "closedLost", "orderCreated"].includes(q.status))
      .reduce((sum, q) => {
        const statusInfo = QUOTE_STATUSES.find(s => s.value === q.status)
        const percentage = statusInfo?.percentage || 0
        return sum + ((q.estimatedValue || q.price || 0) * percentage / 100)
      }, 0)

    // Won value from closed won quotes
    const wonValue = quotes
      .filter((q) => ["closedWon", "orderCreated"].includes(q.status))
      .reduce((sum, q) => sum + (q.price || q.estimatedValue || 0), 0)

    const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.price || 0), 0)
    const totalEstimatedValue = quotes.reduce((sum, q) => sum + (q.estimatedValue || 0), 0)

    return {
      totalLeads,
      wonLeads,
      activeLeads,
      conversionRate,
      totalQuotes,
      wonQuotes,
      activeQuotes,
      quoteWinRate,
      totalPipelineValue,
      weightedPipelineValue,
      wonValue,
      totalQuoteValue,
      totalEstimatedValue,
    }
  }, [leads, quotes])

  const leadsByStatus = useMemo(() => {
    return LEAD_STATUSES.map((status) => ({
      name: status.label,
      value: leads.filter((l) => l.status === status.value).length,
      color: status.color,
    }))
  }, [leads])

  const quotesByStatus = useMemo(() => {
    return QUOTE_STATUSES.map((status) => ({
      name: status.label,
      value: quotes.filter((q) => q.status === status.value).length,
      color: status.color,
    }))
  }, [quotes])

  const leadsTrend = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date
    })

    return last30Days.map((date) => {
      const dayLeads = leads.filter((l) => {
        const leadDate = new Date(l.createdAt)
        return (
          leadDate.toDateString() === date.toDateString()
        )
      })
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        leads: dayLeads.length,
        value: dayLeads.reduce((sum, l) => sum + l.estimatedValue, 0),
      }
    })
  }, [leads])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
    return `€${value.toFixed(0)}`
  }

  const kpiCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      change: stats.activeLeads,
      changeLabel: "active",
      icon: Users,
      trend: "up" as const,
      color: "text-blue-500",
    },
    {
      title: "Quote Win Rate",
      value: `${stats.quoteWinRate.toFixed(1)}%`,
      change: stats.wonQuotes,
      changeLabel: "won",
      icon: Target,
      trend: stats.quoteWinRate > 20 ? ("up" as const) : ("down" as const),
      color: "text-emerald-500",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(stats.totalPipelineValue),
      change: formatCurrency(stats.weightedPipelineValue),
      changeLabel: "weighted",
      icon: DollarSign,
      trend: "up" as const,
      color: "text-amber-500",
    },
    {
      title: "Total Quotes",
      value: stats.totalQuotes,
      change: stats.activeQuotes,
      changeLabel: "active",
      icon: FileText,
      trend: "up" as const,
      color: "text-violet-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
                )}
                <span>
                  {typeof kpi.change === "number" && kpi.change > 1000
                    ? `$${(kpi.change / 1000).toFixed(0)}K`
                    : kpi.change}{" "}
                  {kpi.changeLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Leads by Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Leads", color: "hsl(var(--chart-1))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStatus} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quotes by Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quotes by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Quotes", color: "hsl(var(--chart-2))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quotesByStatus.filter((q) => q.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {quotesByStatus
                      .filter((q) => q.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {quotesByStatus
                .filter((q) => q.value > 0)
                .map((status) => (
                  <div
                    key={status.name}
                    className="flex items-center gap-1 text-xs"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-muted-foreground">
                      {status.name} ({status.value})
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads Trend */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Leads Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                leads: { label: "Leads", color: "hsl(var(--chart-1))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadsTrend}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
