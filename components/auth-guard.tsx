"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const isAuth = localStorage.getItem("isAuthenticated") === "true"
        const token = localStorage.getItem("authToken")

        console.log("[v0] AuthGuard check:", { isAuth, hasToken: !!token })

        setIsChecking(false)

        if (!isAuth || !token) {
          console.log("[v0] Not authenticated, redirecting to login")
          router.push("/login")
        } else {
          console.log("[v0] User authenticated, showing dashboard")
        }
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
