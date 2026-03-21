"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { BarChart3, Briefcase, Users, Settings, Edit2, MapPin, DollarSign, Calendar, Clock } from "lucide-react"

const navItems = [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
    { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function ViewJobPage() {
    const params = useParams()
    const id = params.id
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
                console.error("Failed to fetch job details:", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchJob()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Job Not Found</h2>
                    <Link href="/recruiter/jobs">
                        <Button className="btn-primary">Back to Jobs</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background">
            <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Job Details" />

            <main className="flex-1 overflow-auto md:ml-0">
                <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
                    <div className="pt-12 md:pt-0 flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold text-foreground">{job.title}</h1>
                                <Badge className={job.is_active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}>
                                    {job.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : job.salary_min || "Competitive"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {job.employment_type}
                                </div>
                            </div>
                        </div>
                        <Link href={`/recruiter/jobs/${id}/edit`}>
                            <Button className="btn-primary gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Posting
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <Card className="p-6 border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold text-foreground">Detailed Description</h3>
                                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {job.description}
                                </div>
                            </Card>

                            <Card className="p-6 border-border bg-card space-y-4">
                                <h3 className="text-lg font-bold text-foreground">AI Refined Content</h3>
                                <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg italic">
                                    {job.ai_generated_description || "AI description is being generated..."}
                                </div>
                            </Card>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <Card className="p-6 border-border bg-card space-y-4">
                                    <h3 className="text-lg font-bold text-foreground">Requirements</h3>
                                    <ul className="space-y-2">
                                        {job.requirements?.map((req: string, i: number) => (
                                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                                <Card className="p-6 border-border bg-card space-y-4">
                                    <h3 className="text-lg font-bold text-foreground">Skills Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills_required?.map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-6 border-border bg-card">
                                <h3 className="font-bold text-foreground mb-4">Engagement</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Views</span>
                                        <span className="font-bold">{job.views_count || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Applications</span>
                                        <span className="font-bold">{job.application_count || 0}</span>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <Link href="/recruiter/candidates">
                                            <Button variant="outline" className="w-full text-foreground border-border bg-transparent">
                                                View Candidates
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-border bg-card">
                                <h3 className="font-bold text-foreground mb-4">Job Info</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Experience</span>
                                        <span className="font-medium text-foreground">{job.experience_level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium text-foreground">{job.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Posted Date</span>
                                        <span className="font-medium text-foreground">{new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
