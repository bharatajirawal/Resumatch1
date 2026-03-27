"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import dynamic from 'next/dynamic'

const MatchAnalytics = dynamic(() => import('@/components/match-analytics').then((mod) => mod.MatchAnalytics), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
})
import { Card } from "@/components/ui/card"
import { BarChart3, Sparkles, Briefcase, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" />, badge: "12" },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Analytics" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Match Analytics</h1>
            <p className="text-muted-foreground">Insights about your job matches and application performance</p>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Total Matches</p>
                <p className="text-3xl font-bold text-foreground">43</p>
                <p className="text-xs text-accent">This month</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Avg Match Score</p>
                <p className="text-3xl font-bold text-foreground">78%</p>
                <p className="text-xs text-accent">+2% vs last month</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Applications</p>
                <p className="text-3xl font-bold text-foreground">24</p>
                <p className="text-xs text-accent">9 this month</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Response Rate</p>
                <p className="text-3xl font-bold text-foreground">42%</p>
                <p className="text-xs text-accent">Positive responses</p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <MatchAnalytics />
        </div>
      </main>
    </div>
  )
}
