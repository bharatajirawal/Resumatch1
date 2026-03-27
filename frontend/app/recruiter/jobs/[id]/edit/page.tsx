"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { JobPostingForm } from "@/components/job-posting-form"
import { BarChart3, Briefcase, Users, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const navItems = [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
    { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function EditJobPage() {
    const params = useParams()
    const id = params.id
    const { toast } = useToast()
    const router = useRouter()
    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            const token = localStorage.getItem("access_token")
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setJob(data)
                }
            } catch (err) {
                console.error("Failed to fetch job for editing:", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchJob()
    }, [id])

    const handleSubmit = async (data: any) => {
        const token = localStorage.getItem("access_token")

        try {
            let salary_min = null
            let salary_max = null
            const salaryRange = data.salary.match(/\d+/g)
            if (salaryRange && salaryRange.length >= 2) {
                salary_min = parseInt(salaryRange[0])
                salary_max = parseInt(salaryRange[1])
            } else if (salaryRange && salaryRange.length === 1) {
                salary_min = parseInt(salaryRange[0])
            }

            const formattedData = {
                title: data.title,
                description: data.description,
                location: data.location,
                salary_min: salary_min,
                salary_max: salary_max,
                employment_type: data.jobType,
                experience_level: data.experienceLevel,
                category: data.category,
                requirements: data.requirements.split("\n").filter((r: string) => r.trim() !== ""),
                skills_required: data.skills.split("\n").filter((s: string) => s.trim() !== ""),
            }

            const response = await fetch(`${API_BASE_URL}/jobs/${id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formattedData),
            })

            if (response.ok) {
                toast({
                    title: "Job Updated",
                    description: "Your job posting has been updated successfully.",
                })
                router.push("/recruiter/jobs")
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update job posting.",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Failed to submit job update:", err)
            toast({
                title: "Error",
                description: "Failed to connect to the server.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background">
            <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Edit Job" />

            <main className="flex-1 overflow-auto md:ml-0">
                <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
                    <div className="pt-12 md:pt-0">
                        <h1 className="text-4xl font-bold text-foreground mb-2">Edit Job Posting</h1>
                        <p className="text-muted-foreground">Adjust the details of your job opening</p>
                    </div>

                    {job && (
                        <JobPostingForm
                            onSubmit={handleSubmit}
                            initialData={job}
                            isEditing={true}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}
