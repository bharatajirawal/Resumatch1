"use client"

import type React from "react"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Sparkles, Briefcase, Settings, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"


const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Applications", href: "/dashboard/applications", icon: <Clock className="w-5 h-5" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    location: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
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

          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            phone: data.phone_number || "",
            jobTitle: data.candidate_profile?.headline || "",
            location: data.candidate_profile?.location || "",
          })
        } else if (response.status === 401) {
          window.location.href = "/login"
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err)
      } finally {
        setFetching(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const token = localStorage.getItem("access_token")

    try {
      const patchData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        candidate_profile: {
          headline: formData.jobTitle,
          location: formData.location,
        },
      }

      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patchData),
      })

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.detail || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Settings" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>

          {/* Profile Settings */}
          <Card className="border border-border bg-card p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">First Name</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Last Name</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Email (Managed by System)</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Job Title</label>
                <Input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? "Saving..." : "Save Changes"}
            </Button>

          </Card>

          {/* Notification Preferences */}
          <Card className="border border-border bg-card p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "newMatches",
                  label: "New Job Matches",
                  description: "Get notified about new jobs that match your profile",
                },
                { id: "applications", label: "Application Updates", description: "Updates on your applications" },
                { id: "newsletters", label: "Career Newsletters", description: "Weekly career tips and insights" },
              ].map((pref) => (
                <label key={pref.id} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border mt-1 cursor-pointer" />
                  <div>
                    <p className="font-medium text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
