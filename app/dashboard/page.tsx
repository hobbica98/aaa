"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjects } from "@/lib/storage"
import { TEAMS } from "@/lib/types"
import { useEffect, useState } from "react"
import { DollarSign, Clock, FolderKanban, Users } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function DashboardPage() {
  const [totalValue, setTotalValue] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [assignedProjects, setAssignedProjects] = useState(0)
  const [teamData, setTeamData] = useState<any[]>([])

  useEffect(() => {
    const projects = getProjects()

    const total = projects.reduce((sum, p) => sum + p.value, 0)
    const hours = projects.reduce((sum, p) => sum + p.estimatedHours, 0)
    const assigned = projects.filter((p) => p.teamId).length

    setTotalValue(total)
    setTotalProjects(projects.length)
    setTotalHours(hours)
    setAssignedProjects(assigned)

    // Calculate team workload
    const teamWorkload = TEAMS.map((team) => {
      const teamProjects = projects.filter((p) => p.teamId === team.id)
      return {
        name: team.name.replace(" Team", ""),
        projects: teamProjects.length,
        hours: teamProjects.reduce((sum, p) => sum + p.estimatedHours, 0),
        value: teamProjects.reduce((sum, p) => sum + p.value, 0),
      }
    })
    setTeamData(teamWorkload)
  }, [])

  const kpiCards = [
    {
      title: "Total Project Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Projects",
      value: totalProjects.toString(),
      icon: FolderKanban,
      color: "text-blue-600",
    },
    {
      title: "Estimated Hours",
      value: totalHours.toLocaleString(),
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Assigned to Teams",
      value: `${assignedProjects}/${totalProjects}`,
      icon: Users,
      color: "text-purple-600",
    },
  ]

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your project pipeline</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((kpi) => (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  projects: {
                    label: "Projects",
                    color: "hsl(var(--chart-1))",
                  },
                  hours: {
                    label: "Hours",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="projects" fill="var(--color-projects)" name="Projects" />
                    <Bar dataKey="hours" fill="var(--color-hours)" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
