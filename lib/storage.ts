"use client"

import type { Project } from "./types"

const STORAGE_KEY = "roadmap_projects"

export function getProjects(): Project[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  const projects = JSON.parse(stored)
  return projects.map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
  }))
}

export function saveProject(project: Project) {
  const projects = getProjects()
  const existingIndex = projects.findIndex((p) => p.id === project.id)

  if (existingIndex >= 0) {
    projects[existingIndex] = project
  } else {
    projects.push(project)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function updateProjectTeam(projectId: string, teamId: string) {
  const projects = getProjects()
  const project = projects.find((p) => p.id === projectId)

  if (project) {
    project.teamId = teamId
    project.status = "assigned"
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }
}
