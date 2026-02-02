import { apiClient, handleApiError } from "./client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

/**
 * Login to the external API using Basic Authentication
 * Based on the curl command provided
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Create Basic Auth token from email and password
    const basicAuth = btoa(`${credentials.email}:${credentials.password}`)

    const response = await apiClient.post<LoginResponse>(
      "/auth",
      {},
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          Referer: "https://zenithar-abacus.prod.aws.r-s.cloud/",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json, text/plain, */*",
        },
      },
    )

    // Store the auth token
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", credentials.email)
    }

    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    throw new Error(apiError.message)
  }
}

/**
 * Logout - clear local storage
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

/**
 * Get current user email
 */
export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userEmail")
}
