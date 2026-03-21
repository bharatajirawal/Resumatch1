"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { BarChart3, Briefcase, Users, Settings, Mail, Phone, MapPin, Download, ExternalLink, Calendar } from "lucide-react"

const navItems = [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
    { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function CandidateDetailPage() {
    const params = useParams()
    const id = params.id
    const [candidate, setCandidate] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCandidate = async () => {
            const token = localStorage.getItem("access_token")
            try {
                const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setCandidate(data)
                }
            } catch (err) {
                console.error("Failed to fetch candidate details:", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchCandidate()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!candidate) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Candidate Not Found</h2>
                    <Link href="/recruiter/candidates">
                        <Button className="btn-primary">Back to Candidates</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background">
            <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Candidate Profile" />

            <main className="flex-1 overflow-auto md:ml-0">
                <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
                    <div className="pt-12 md:pt-0 flex items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-4xl border-2 border-border">
                            👤
                        </div>
                        <div className="flex-1 space-y-2">
                            <h1 className="text-4xl font-bold text-foreground">{candidate.first_name} {candidate.last_name}</h1>
                            <p className="text-xl text-muted-foreground">{candidate.candidate_profile?.headline || "Candidate"}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {candidate.email}
                                </div>
                                {candidate.phone_number && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {candidate.phone_number}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {candidate.candidate_profile?.location || "Not specified"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(candidate.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <Button className="btn-primary">Contact Candidate</Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            {candidate.bio && (
                                <Card className="p-6 border-border bg-card">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Bio</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{candidate.bio}</p>
                                </Card>
                            )}

                            <Card className="p-6 border-border bg-card">
                                <h3 className="text-lg font-bold text-foreground mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.candidate_profile?.skills?.map((skill: string, i: number) => (
                                        <Badge key={i} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {(!candidate.candidate_profile?.skills || candidate.candidate_profile.skills.length === 0) && (
                                        <p className="text-sm text-muted-foreground italic">No skills listed</p>
                                    )}
                                </div>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-foreground">Resumes</h3>
                                <div className="space-y-4">
                                    {candidate.resumes?.map((resume: any) => (
                                        <Card key={resume.id} className="p-6 border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-muted rounded-lg shrink-0">
                                                    <ExternalLink className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="font-bold text-foreground">{resume.title || resume.file?.split('/').pop() || 'Resume'}</p>
                                                        {resume.is_primary && (
                                                            <Badge className="bg-accent text-accent-foreground text-[10px]">Primary</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-end md:justify-center">
                                                <div className="text-right mr-4 hidden md:block">
                                                    <div className="text-xl font-bold text-foreground">{resume.ai_score || 0}%</div>
                                                    <div className="text-[10px] text-muted-foreground">AI Score</div>
                                                </div>
                                                
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="bg-transparent border-border hover:bg-muted text-foreground"
                                                    onClick={() => {
                                                        const win = window.open(resume.file, '_blank');
                                                        win?.focus();
                                                    }}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Preview
                                                </Button>
                                                <a href={resume.file} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm" className="bg-transparent border-border hover:bg-muted text-foreground">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </a>
                                            </div>
                                        </Card>
                                    ))}
                                    {(!candidate.resumes || candidate.resumes.length === 0) && (
                                        <Card className="p-12 border-border bg-card text-center text-muted-foreground italic">
                                            No resumes uploaded by this candidate.
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-6 border-border bg-card">
                                <h3 className="font-bold text-foreground mb-4">Experience</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-muted-foreground">Total Experience</span>
                                        <span className="font-bold text-foreground">{candidate.candidate_profile?.experience_years || 0} Years</span>
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
