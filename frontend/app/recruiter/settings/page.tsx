"use client"

import type React from "react"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Briefcase, Users, Settings, ShieldCheck, CheckCircle2, Globe, Linkedin, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const [trustInfo, setTrustInfo] = useState<any>(null)

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
          setTrustInfo(data.recruiter_profile?.trust_score || null)
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

  const handleVerify = async (type: 'linkedin' | 'website' | 'proof') => {
    const token = localStorage.getItem("access_token")
    const endpoint = type === 'linkedin' ? 'verify_linkedin' : (type === 'website' ? 'verify_website' : 'verify_proof')
    
    try {
       const response = await fetch(`${API_BASE_URL}/users/${endpoint}/`, {
          method: "POST",
          headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "application/json"
          },
          body: JSON.stringify({ linkedin_url: formData.website }) // fallback
       })
       
       if (response.ok) {
          const data = await response.json()
          setTrustInfo(data.trust_score)
          toast({
             title: "Success",
             description: data.message
          })
       }
    } catch (err) {
       console.error("Verification failed:", err)
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

          <div className="grid gap-6">
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

                <Button onClick={handleSubmit} disabled={loading} className="btn-primary w-full md:w-auto">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>

            <Card className="border-2 border-primary/20 bg-primary/5 p-8 space-y-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-24 h-24" />
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" /> Recruiter Verification
                  </h3>
                  <p className="text-sm text-muted-foreground">Boost your trust rating to attract more talent</p>
               </div>

               <div className="bg-background/50 rounded-2xl p-6 border border-border shadow-inner">
                  <div className="flex justify-between items-end mb-4">
                     <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trust Score</p>
                        <h2 className="text-4xl font-black text-foreground">{trustInfo?.score || 0}%</h2>
                     </div>
                     <Badge variant={trustInfo?.is_verified ? "default" : "secondary"} className={trustInfo?.is_verified ? "bg-green-500 hover:bg-green-600 h-8 px-4" : "h-8 px-4"}>
                        {trustInfo?.badge || "Unverified"}
                     </Badge>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${trustInfo?.badge_color === 'green' ? 'bg-green-500' : trustInfo?.badge_color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${trustInfo?.score || 0}%` }}
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-5 h-5 ${trustInfo?.verifications?.email ? 'text-green-500' : 'text-muted-foreground opacity-30'}`} />
                        <div>
                           <p className="text-sm font-bold">Email Verified</p>
                           <p className="text-xs text-muted-foreground">Official communication confirmed</p>
                        </div>
                     </div>
                     {!trustInfo?.verifications?.email && (
                        <Button size="sm" variant="outline" onClick={() => window.location.href='/verify-email'}>Verify</Button>
                     )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                     <div className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 ${trustInfo?.verifications?.website ? 'text-green-500' : 'text-muted-foreground opacity-30'}`} />
                        <div>
                           <p className="text-sm font-bold">Domain Match</p>
                           <p className="text-xs text-muted-foreground">Email matches company website domain</p>
                        </div>
                     </div>
                     {!trustInfo?.verifications?.website && (
                        <Button size="sm" variant="outline" onClick={() => handleVerify('website')}>Verify Now</Button>
                     )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                     <div className="flex items-center gap-3">
                        <Linkedin className={`w-5 h-5 ${trustInfo?.verifications?.linkedin ? 'text-green-500' : 'text-muted-foreground opacity-30'}`} />
                        <div>
                           <p className="text-sm font-bold">LinkedIn Profile</p>
                           <p className="text-xs text-muted-foreground">Official LinkedIn page linked</p>
                        </div>
                     </div>
                     {!trustInfo?.verifications?.linkedin ? (
                        <Button size="sm" variant="outline" onClick={() => handleVerify('linkedin')}>Connect</Button>
                     ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Verified</Badge>
                     )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                     <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${trustInfo?.verifications?.proof ? "text-green-500" : "text-muted-foreground opacity-30"}`} />
                        <div>
                           <p className="text-sm font-bold">Company Proof</p>
                           <p className="text-xs text-muted-foreground">Official business registration documents</p>
                        </div>
                     </div>
                     {!trustInfo?.verifications?.proof ? (
                        <Button size="sm" variant="outline" onClick={() => handleVerify("proof")}>
                           Verify Now
                        </Button>
                     ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
                           Verified
                        </Badge>
                     )}
                  </div>
               </div>
               
               {trustInfo?.score < 80 && (
                  <p className="text-xs text-center text-muted-foreground bg-muted/50 p-3 rounded-lg">
                     💡 Reach 80% to get the <b>Verified Recruiter ✅</b> badge on all your job postings.
                  </p>
               )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
