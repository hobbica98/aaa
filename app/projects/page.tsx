"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useEffect, useState } from "react"
import { getProjects, deleteProject } from "@/lib/storage"
import { type Project, TEAMS } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, Tag, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamAssignment } from "@/components/team-assignment"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "assigned">("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadProjects = () => {
    const allProjects = getProjects()
    setProjects(allProjects)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id)
      loadProjects()
    }
  }

  const handleAssignSuccess = () => {
    loadProjects()
    setDialogOpen(false)
    setSelectedProject(null)
  }

  const filteredProjects = projects.filter((p) => {
    if (filter === "pending") return !p.teamId
    if (filter === "assigned") return !!p.teamId
    return true
  })

  const getTeamName = (teamId?: string) => {
    if (!teamId) return null
    return TEAMS.find((t) => t.id === teamId)?.name
  }

  const getTeamColor = (teamId?: string) => {
    if (!teamId) return "#gray"
    return TEAMS.find((t) => t.id === teamId)?.color
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Project Pipeline</h1>
              <p className="text-muted-foreground">Manage and assign incoming projects</p>
            </div>
            <Link href="/projects/new">
              <Button>Add New Project</Button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 border-b">
            <Button variant={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")}>
              All Projects ({projects.length})
            </Button>
            <Button variant={filter === "pending" ? "default" : "ghost"} onClick={() => setFilter("pending")}>
              Pending Assignment ({projects.filter((p) => !p.teamId).length})
            </Button>
            <Button variant={filter === "assigned" ? "default" : "ghost"} onClick={() => setFilter("assigned")}>
              Assigned ({projects.filter((p) => p.teamId).length})
            </Button>
          </div>

          {/* Project list */}
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">No projects found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="relative overflow-hidden">
                  {project.teamId && (
                    <div
                      className="absolute left-0 top-0 h-1 w-full"
                      style={{ backgroundColor: getTeamColor(project.teamId) }}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      {project.icon && <span className="text-2xl">{project.icon}</span>}
                    </div>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Tag className="mr-1 h-3 w-3" />
                        {project.tag}
                      </Badge>
                      {project.teamId && (
                        <Badge
                          style={{
                            backgroundColor: getTeamColor(project.teamId),
                            color: "white",
                          }}
                        >
                          {getTeamName(project.teamId)}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">${project.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{project.estimatedHours}h estimated</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog
                        open={dialogOpen && selectedProject?.id === project.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedProject(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedProject(project)}
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            {project.teamId ? "Reassign" : "Assign"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign to Team</DialogTitle>
                            <DialogDescription>Select a team for {project.title}</DialogDescription>
                          </DialogHeader>
                          {selectedProject && (
                            <TeamAssignment project={selectedProject} onSuccess={handleAssignSuccess} />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
