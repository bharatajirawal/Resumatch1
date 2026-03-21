"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Briefcase, TrendingUp, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

const jobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Corp",
    postedBy: "hr@techcorp.com",
    applications: 18,
    status: "Active",
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Inc",
    postedBy: "jobs@startup.com",
    applications: 12,
    status: "Active",
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Design Studio",
    postedBy: "hr@design.com",
    applications: 5,
    status: "Closed",
  },
  {
    id: 4,
    title: "UX/UI Designer",
    company: "Tech Corp",
    postedBy: "hr@techcorp.com",
    applications: 8,
    status: "Active",
  },
]

export default function JobsManagementPage() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar items={navItems} />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Job Postings</h1>
            <p className="text-muted-foreground">Manage all job postings on the platform</p>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                    <p className="text-xs text-muted-foreground">Posted by: {job.postedBy}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{job.applications}</div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>

                    <Badge
                      className={
                        job.status === "Active" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }
                    >
                      {job.status}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
