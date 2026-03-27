"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Briefcase, TrendingUp, Settings, MoreVertical } from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
]

const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    type: "Candidate",
    status: "Active",
    joined: "2 months ago",
  },
  {
    id: 2,
    name: "Michael Corp",
    email: "michael@corp.com",
    type: "Recruiter",
    status: "Active",
    joined: "1 month ago",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@example.com",
    type: "Candidate",
    status: "Inactive",
    joined: "3 weeks ago",
  },
  {
    id: 4,
    name: "Tech Startup Inc",
    email: "hr@startup.com",
    type: "Recruiter",
    status: "Active",
    joined: "2 weeks ago",
  },
  { id: 5, name: "Alex Chen", email: "alex@example.com", type: "Candidate", status: "Active", joined: "1 week ago" },
]

export default function UsersPage() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar items={navItems} />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Users</h1>
              <p className="text-muted-foreground">Manage platform users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["all", "candidates", "recruiters", "active", "inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* User List */}
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <Badge
                        className={
                          user.type === "Candidate"
                            ? "bg-accent text-accent-foreground"
                            : "bg-primary text-primary-foreground"
                        }
                      >
                        {user.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{user.joined}</p>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "Active" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      <MoreVertical className="w-4 h-4" />
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
