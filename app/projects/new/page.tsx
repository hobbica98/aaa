"use client"

import type React from "react"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveProject } from "@/lib/storage"
import type { Project } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    description: "",
    tag: "",
    estimatedHours: "",
    icon: "",
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: formData.title,
      value: Number.parseFloat(formData.value) || 0,
      description: formData.description,
      tag: formData.tag,
      estimatedHours: Number.parseFloat(formData.estimatedHours) || 0,
      icon: formData.icon,
      attachedFile: file,
      status: "pending",
      createdAt: new Date(),
    }

    saveProject(newProject)
    router.push("/projects")
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">Add a confirmed order to your pipeline</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Fill in all the information for the new project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value (USD) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the project scope and objectives"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag *</Label>
                    <Input
                      id="tag"
                      value={formData.tag}
                      onChange={(e) => handleChange("tag", e.target.value)}
                      placeholder="e.g., Website, Mobile, API"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => handleChange("estimatedHours", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji or Symbol)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => handleChange("icon", e.target.value)}
                    placeholder="e.g., 🚀, 💼, ⚡"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Add an emoji or symbol to represent this project
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Attach File</Label>
                  <div className="flex items-center gap-3">
                    <Input id="file" type="file" onChange={handleFileChange} className="flex-1" />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Project
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
