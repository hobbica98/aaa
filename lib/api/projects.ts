import { apiClient, handleApiError } from "./client"
import type { Project } from "../types"

export interface CreateProjectDto {
  title: string
  value: number
  description: string
  tag: string
  estimatedHours: number
  attachedFile?: File | null
  icon?: string
}

/**
 * Get all projects from the API
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get<Project[]>("/projects")
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    console.error("[v0] Error fetching projects:", apiError)
    throw new Error(apiError.message)
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project> {
  try {
    const response = await apiClient.get<Project>(`/projects/${id}`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  try {
    // If there's a file, use FormData
    if (data.attachedFile) {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("value", data.value.toString())
      formData.append("description", data.description)
      formData.append("tag", data.tag)
      formData.append("estimatedHours", data.estimatedHours.toString())
      formData.append("file", data.attachedFile)
      if (data.icon) formData.append("icon", data.icon)

      const response = await apiClient.post<Project>("/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    }

    // Otherwise, send JSON
    const response = await apiClient.post<Project>("/projects", data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Update a project
 */
export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  try {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Assign a project to a team
 */
export async function assignProjectToTeam(projectId: string, teamId: string): Promise<Project> {
  try {
    const response = await apiClient.patch<Project>(`/projects/${projectId}/assign`, {
      teamId,
      status: "assigned",
    })
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await apiClient.delete(`/projects/${id}`)
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}
