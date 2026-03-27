"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import dynamic from 'next/dynamic'

const AdminAnalytics = dynamic(() => import('@/components/admin-analytics').then((mod) => mod.AdminAnalytics), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
})
import { BarChart3, Users, Briefcase, TrendingUp, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar items={navItems} />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Detailed platform analytics and insights</p>
          </div>

          <AdminAnalytics />
        </div>
      </main>
    </div>
  )
}
