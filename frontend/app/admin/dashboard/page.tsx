"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import dynamic from 'next/dynamic'

const AdminAnalytics = dynamic(() => import('@/components/admin-analytics').then((mod) => mod.AdminAnalytics), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
})
import { Card } from "@/components/ui/card"
import { BarChart3, Users, Briefcase, TrendingUp, AlertCircle, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar items={navItems} />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and key metrics</p>
          </div>

          {/* Alert */}
          <Card className="border border-destructive/30 bg-destructive/5 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">System Status</h4>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </div>
          </Card>

          {/* KPIs */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Total Users</p>
                <p className="text-3xl font-bold text-foreground">1,250</p>
                <p className="text-xs text-accent">+128 this month</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Active Jobs</p>
                <p className="text-3xl font-bold text-foreground">324</p>
                <p className="text-xs text-accent">+45 this week</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Total Matches</p>
                <p className="text-3xl font-bold text-foreground">1,866</p>
                <p className="text-xs text-accent">+234 this month</p>
              </div>
            </Card>
            <Card className="border border-border bg-card p-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">78%</p>
                <p className="text-xs text-accent">+3% vs last month</p>
              </div>
            </Card>
          </div>

          {/* Analytics */}
          <AdminAnalytics />
        </div>
      </main>
    </div>
  )
}
