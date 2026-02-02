import { apiClient, handleApiError } from "./client"
import type { Team } from "../types"

/**
 * Get all teams from the external API
 */
export async function getTeams(): Promise<Team[]> {
  try {
    const response = await apiClient.get<Team[]>("/teams")
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    console.error("[v0] Error fetching teams:", apiError)
    throw new Error(apiError.message)
  }
}

/**
 * Get a single team by ID
 */
export async function getTeamById(id: string): Promise<Team> {
  try {
    const response = await apiClient.get<Team>(`/teams/${id}`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Get team workload statistics
 */
export async function getTeamWorkload(teamId: string): Promise<{
  teamId: string
  totalProjects: number
  totalHours: number
  activeProjects: number
}> {
  try {
    const response = await apiClient.get(`/teams/${teamId}/workload`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}
