"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Briefcase, Users, Settings, Eye, Heart } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
  { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

import Link from "next/link"
import { RecruiterVerificationBadge } from "@/components/recruiter-verification-badge"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/providers/auth-provider"

export default function RecruiterDashboard() {
  const { user } = useAuth()

  // Fetch Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['recruiter-dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get("/users/dashboard/")
      return response.data
    },
    enabled: !!user && user.user_type === 'recruiter'
  })

  // Fetch Recent Jobs
  const { data: jobsData = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiter-recent-jobs'],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/my_jobs/")
      const data = response.data
      return Array.isArray(data) ? data : (data?.results || [])
    },
    enabled: !!user && user.user_type === 'recruiter'
  })

  const stats = statsData?.stats
  const recentJobs = jobsData.slice(0, 3)
  const loading = statsLoading || jobsLoading

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Dashboard" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading your dashboard..." : "Welcome back! Manage your job postings and candidates."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-border bg-card p-6 shadow-sm">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="border border-border bg-card p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Active Postings</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.active_jobs || 0}</p>
                    <p className="text-xs text-accent">Live now</p>
                  </div>
                </Card>
                <Card className="border border-border bg-card p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Applications</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.total_applications || 0}</p>
                    <p className="text-xs text-accent">Total received</p>
                  </div>
                </Card>
                 <Card className="border border-border bg-card p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase text-accent">Trust Rating</p>
                    <p className={`text-3xl font-bold ${stats?.trust_score?.badge_color === 'green' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {stats?.trust_score?.score || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats?.trust_score?.badge || 'Unverified'}</p>
                  </div>
                </Card>
                <Card className="border border-border bg-card p-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">New Candidates</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.new_candidates || 0}</p>
                    <p className="text-xs text-accent">Awaiting review</p>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Recent Jobs */}
          <Card className="border border-border bg-card p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Recent Job Postings</h3>
                <Link href="/recruiter/jobs">
                  <Button className="btn-primary">View All</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </>
                ) : recentJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No job postings yet. <Link href="/recruiter/jobs/new" className="text-accent hover:underline">Create one now</Link>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <Link href={`/recruiter/jobs/${job.id}`} key={job.id} className="block">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground">{job.title}</h4>
                            <RecruiterVerificationBadge trustInfo={job.recruiter_verification} />
                          </div>
                          <p className="text-xs text-muted-foreground">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-foreground">
                              <Eye className="w-4 h-4" />
                              {job.views_count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-foreground">
                              <Heart className="w-4 h-4" />
                              {job.application_count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Apps</p>
                          </div>
                          <div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${job.is_active
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground"
                                }`}
                            >
                              {job.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
