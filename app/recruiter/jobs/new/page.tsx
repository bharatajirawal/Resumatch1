"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { JobPostingForm } from "@/components/job-posting-form"
import { BarChart3, Briefcase, Users, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"


const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
  { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function NewJobPage() {
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    console.log("Submitting job:", data)
    const token = localStorage.getItem("access_token")

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to post a job.",
        variant: "destructive",
      })
      window.location.href = "/login"
      return
    }

    try {
      const formattedData = {
        title: data.title,
        description: data.description || data.about_role,
        about_role: data.about_role,
        responsibilities: data.responsibilities,
        requirements: data.requirements,
        nice_to_have: data.nice_to_have,
        benefits: data.benefits,
        location: data.location,
        salary_min: parseInt(data.salary_min) || null,
        salary_max: parseInt(data.salary_max) || null,
        salary_currency: data.salary_currency,
        salary_type: data.salary_type,
        employment_type: data.jobType,
        experience_level: data.experienceLevel,
        category: data.category,
        skills_required: data.skills,
      }

      const response = await fetch(`${API_BASE_URL}/jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        toast({
          title: "Job Posted!",
          description: "Your job posting has been created successfully.",
        })
        window.location.href = "/recruiter/jobs"
      } else {
        const errorData = await response.json()
        console.error("Submission error:", errorData)
        toast({
          title: "Error",
          description: "Failed to post job. Please check all fields.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to submit job:", err)
      toast({
        title: "Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Post Job" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Post New Job</h1>
            <p className="text-muted-foreground">Fill in the details to create a new job posting</p>
          </div>

          <JobPostingForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}
