"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Sparkles, Briefcase, Settings, Clock } from "lucide-react"
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
  { label: "Applications", href: "/dashboard/applications", icon: <Clock className="w-4 h-4" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

import { useDashboardData } from "@/hooks/use-dashboard-data"

export default function DashboardPage() {
  const { data, isLoading: loading, error, refetch } = useDashboardData()
  const stats = data?.stats

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch dashboard data:", error)
      if ((error as any).response?.status === 401) {
        window.location.href = "/login"
      }
    }
    
    if (data && data.user_type !== "candidate") {
      window.location.href = data.user_type === "recruiter" ? "/recruiter/dashboard" : "/login"
    }
  }, [data, error])

  return (
    <div className="flex h-screen bg-background selection:bg-primary/30">
      <SidebarNav items={navItems} title="Candidate" subtitle="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_25%),_radial-gradient(ellipse_at_bottom_left,_var(--color-accent)_0%,_transparent_25%)] bg-fixed">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="pt-12 md:pt-0 space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              {loading
                ? "Synchronizing your career data..."
                : stats?.has_resume
                ? "Elevating your professional profile with AI."
                : "Welcome! Let's build your optimized resume."}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-border bg-card/50 backdrop-blur-md p-6 shadow-sm">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resume Score</p>
                      <Sparkles className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-black text-foreground tabular-nums">{stats?.resume_score || 0}</p>
                      <span className="text-xs font-bold text-muted-foreground">/100</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out" 
                        style={{ width: `${stats?.resume_score || 0}%` }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Job Matches</p>
                      <Briefcase className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-4xl font-black text-foreground tabular-nums">{stats?.job_matches || 0}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {stats?.job_matches > 0 ? "Tailored opportunities" : "Upload resume to match"}
                    </p>
                  </div>
                </Card>

                <Card className="border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Applications</p>
                      <Clock className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-4xl font-black text-foreground tabular-nums">{stats?.applications || 0}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">Total submissions</p>
                  </div>
                </Card>

                <Card className="border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Profile Views</p>
                      <BarChart3 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-4xl font-black text-foreground tabular-nums">{stats?.profile_views || 0}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">Recruiter interest</p>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            {/* Upload Section */}
            <div className="w-full">
              {loading ? (
                <Skeleton className="h-[280px] w-full rounded-2xl" />
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                  <ResumeUpload
                    onUploadSuccess={refetch}
                    hasResume={!!stats?.has_resume}
                    resumeId={stats?.resume_id}
                  />
                </div>
              )}
            </div>

            {/* Analysis Section */}
            {!loading && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                {stats?.has_resume ? (
                  <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-2xl" />}>
                    <ResumeAnalysis resumeId={stats?.resume_id} />
                  </Suspense>
                ) : (
                  <Card className="border border-border border-dashed bg-card/20 backdrop-blur-sm p-16 text-center group hover:bg-muted/10 transition-colors">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3">Unlock AI-Powered Insights</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed mb-8">
                      Your journey to the perfect job starts here. Upload your resume to activate our deep-learning analysis engine.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
