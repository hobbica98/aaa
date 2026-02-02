"use client"

import { type Project, TEAMS } from "@/lib/types"
import { updateProjectTeam } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface TeamAssignmentProps {
  project: Project
  onSuccess: () => void
}

export function TeamAssignment({ project, onSuccess }: TeamAssignmentProps) {
  const handleAssign = (teamId: string) => {
    updateProjectTeam(project.id, teamId)
    onSuccess()
  }

  return (
    <div className="space-y-3">
      {TEAMS.map((team) => (
        <Button
          key={team.id}
          variant={project.teamId === team.id ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => handleAssign(team.id)}
          style={project.teamId === team.id ? { backgroundColor: team.color, borderColor: team.color } : {}}
        >
          <Users className="mr-2 h-4 w-4" />
          <div className="flex flex-1 items-center justify-between">
            <span>{team.name}</span>
            <span className="text-xs opacity-70">{team.memberCount} members</span>
          </div>
        </Button>
      ))}
    </div>
  )
}
