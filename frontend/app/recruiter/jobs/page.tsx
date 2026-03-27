"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, Briefcase, Users, Settings, Edit2, Trash2, Eye } from "lucide-react"


const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
  { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function JobsPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/my_jobs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setJobs(data)
        } else if (data && Array.isArray(data.results)) {
          setJobs(data.results)
        } else {
          setJobs([])
        }
      } else if (response.status === 401) {
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Job deleted",
          description: "Your job posting has been deleted successfully.",
        })
        setJobs((prev) => prev.filter((j) => j.id !== id))
      } else {
        toast({
          title: "Error",
          description: "Failed to delete job posting",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Job Postings" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Job Postings</h1>
              <p className="text-muted-foreground">Manage and track your job postings</p>
            </div>
            <Link href="/recruiter/jobs/new">
              <Button className="btn-primary">New Posting</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="border border-border bg-card p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No jobs yet</h3>
                  <p className="text-muted-foreground">Create your first job posting to start finding candidates</p>
                </div>
                <Link href="/recruiter/jobs/new">
                  <Button className="btn-primary">New Posting</Button>
                </Link>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="border border-border bg-card p-6 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                        <Badge
                          className={
                            job.is_active
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {job.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.salary_range || "Competitive"}</p>
                      <p className="text-xs text-muted-foreground">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm border-l border-border pl-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{job.views_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{job.application_count || 0}</div>
                        <div className="text-xs text-muted-foreground">Applications</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/recruiter/jobs/${job.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        className="border-border text-destructive hover:bg-destructive/10 gap-2 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
