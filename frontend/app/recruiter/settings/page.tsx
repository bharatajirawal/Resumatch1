"use client"

import type React from "react"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Briefcase, Users, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"


const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
  { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function RecruiterSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
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
          if (data.user_type !== "recruiter") {
            window.location.href = data.user_type === "candidate" ? "/dashboard" : "/login"
            return
          }

          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            companyName: data.recruiter_profile?.company_name || "",
            email: data.email || "",
            phone: data.phone_number || "",
            website: data.recruiter_profile?.company_website || "",
            industry: data.recruiter_profile?.industry || "Technology",
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
      // Ensure website has a protocol if not empty
      let website = formData.website
      if (website && !website.startsWith('http')) {
        website = `https://${website}`
      }

      // Create body without email (email is read-only in backend)
      const patchData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        recruiter_profile: {
          company_name: formData.companyName,
          company_website: website,
          industry: formData.industry,
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
          description: "Your company information has been saved successfully.",
        })
      } else {
        const errorData = await response.json()
        console.error("Profile update error details:", errorData)

        // Format error message from backend
        let errorMessage = "Failed to update profile."
        if (typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ')
        }

        toast({
          title: "Error",
          description: errorMessage || "Failed to update profile",
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
      <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Settings" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your company profile and preferences</p>
          </div>

          <Card className="border border-border bg-card p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">Company Information</h3>
              <p className="text-sm text-muted-foreground">Update your company details</p>
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
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Company Name</label>
                <Input
                  name="companyName"
                  value={formData.companyName}
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
                <label className="block text-sm font-medium text-foreground">Website</label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                >
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Retail</option>
                  <option>Other</option>
                </select>
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : "Save Changes"}
              </Button>

            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
