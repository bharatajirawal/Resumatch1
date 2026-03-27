"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Sparkles, Briefcase, Settings } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import heavy components to reduce initial bundle size
const ResumeUpload = dynamic(() => import("@/components/resume-upload").then(mod => mod.ResumeUpload), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full rounded-xl" />
})

const ResumeAnalysis = dynamic(() => import("@/components/resume-analysis").then(mod => mod.ResumeAnalysis), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Role Guard
        if (data.user_type !== "candidate") {
          window.location.href = data.user_type === "recruiter" ? "/recruiter/dashboard" : "/login"
          return
        }

        setStats(data.stats)
      } else if (response.status === 401) {
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {loading
                ? "Loading your dashboard..."
                : stats?.has_resume
                ? "Manage your career and track your progress."
                : "Welcome! Upload your resume to get started."}
            </p>
          </div>

          {/* Stats Skeletons or Content */}
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
                <Card className="border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resume Score</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold text-foreground">{stats?.resume_score || 0}</p>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {stats?.has_resume ? "Based on primary resume" : "Upload resume to see score"}
                    </p>
                  </div>
                </Card>
                <Card className="border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Matches</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.job_matches || 0}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {stats?.job_matches > 0 ? "Personalized for you" : "No matches found yet"}
                    </p>
                  </div>
                </Card>
                <Card className="border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Applications</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.applications || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total sent</p>
                  </div>
                </Card>
                <Card className="border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profile Views</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.profile_views || 0}</p>
                    <p className="text-[10px] text-muted-foreground">This month</p>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-1 gap-8">
            <div className="lg:col-span-1">
              {loading ? (
                <Skeleton className="h-[250px] w-full rounded-xl" />
              ) : (
                <ResumeUpload
                  onUploadSuccess={fetchDashboardData}
                  hasResume={!!stats?.has_resume}
                  resumeId={stats?.resume_id}
                />
              )}
            </div>
          </div>

          {/* Analysis Section */}
          {!loading && (
            stats?.has_resume ? (
              <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                <ResumeAnalysis resumeId={stats?.resume_id} />
              </Suspense>
            ) : (
              <Card className="border border-border bg-card p-12 text-center border-dashed bg-muted/20">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Unlock Your AI Analysis</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Upload your resume to receive a comprehensive analysis. We'll identify your strengths, suggest improvements, and show you exactly where you stand.
                </p>
              </Card>
            )
          )}
        </div>
      </main>
    </div>
  )
}
