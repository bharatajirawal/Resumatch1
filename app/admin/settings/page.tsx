"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, Briefcase, TrendingUp, Settings } from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "ResuMatch",
    maxJobsPerRecruiter: "50",
    matchingThreshold: "70",
    maintenanceMode: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar items={navItems} />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Settings</h1>
            <p className="text-muted-foreground">Configure platform settings</p>
          </div>

          <Card className="border border-border bg-card p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Platform Settings</h3>
              <p className="text-sm text-muted-foreground">Manage global platform configuration</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Site Name</label>
                <Input
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Max Jobs Per Recruiter</label>
                <Input
                  name="maxJobsPerRecruiter"
                  type="number"
                  value={settings.maxJobsPerRecruiter}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Matching Score Threshold (%)</label>
                <Input
                  name="matchingThreshold"
                  type="number"
                  value={settings.matchingThreshold}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
                <div>
                  <p className="font-medium text-foreground">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Disable user access for maintenance</p>
                </div>
              </label>

              <Button className="btn-primary">Save Settings</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
