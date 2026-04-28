"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Sparkles, Briefcase, Settings, MapPin, DollarSign, Heart, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { RecruiterVerificationBadge } from "@/components/recruiter-verification-badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Applications", href: "/dashboard/applications", icon: <Clock className="w-5 h-5" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

const matches = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    salary: "$150K - $200K",
    matchScore: 95,
    tags: ["React", "Node.js", "TypeScript"],
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Inc",
    location: "New York, NY",
    salary: "$120K - $160K",
    matchScore: 88,
    tags: ["React", "Python", "AWS"],
    posted: "1 week ago",
  },
  {
    id: 3,
    title: "Frontend Engineer",
    company: "Design Studio",
    location: "Remote",
    salary: "$100K - $140K",
    matchScore: 82,
    tags: ["React", "Vue.js", "CSS"],
    posted: "3 days ago",
  },
]

import { useMatches } from "@/hooks/use-matches"
import { useRouter } from "next/navigation"

export default function MatchesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { 
    data: matches = [], 
    isLoading: loading, 
    findMatches, 
    apply, 
    compare 
  } = useMatches()
  
  const [saved, setSaved] = useState<number[]>([])
  const [comparisons, setComparisons] = useState<Record<string, any>>({})

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Job Matches" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Personalized Job Matches</h1>
            <p className="text-muted-foreground">
              {matches.length === 0
                ? "We didn't find any matches yet. Try uploading a resume!"
                : `We found ${matches.length} jobs that match your profile`}
            </p>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <Card className="border border-border bg-card p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No matches found</h3>
                  <p className="text-muted-foreground mb-4">Upload or update your resume to see personalized matches</p>
                  <Button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        const data = await findMatches()
                        if (data.matches && data.matches.length === 0) {
                          toast({
                            title: "No Matches Yet",
                            description: data.message || "No jobs match your profile at this time.",
                          })
                        } else {
                          toast({
                            title: "Matches Found",
                            description: `We found ${(data.matches || data).length} jobs for you!`,
                          })
                        }
                      } catch (err: any) {
                        toast({
                          title: "Cannot Find Matches",
                          description: err.response?.data?.error || "Please upload a resume first.",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Find Matching Jobs
                  </Button>
                </div>
              </Card>
            ) : (
              Array.isArray(matches) && matches.map((match) => (
                <Card key={match.id} className="border border-border bg-card p-6 hover:border-primary transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1">{match.job_details.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-sm text-muted-foreground">{match.job_details.company_name}</p>
                          <RecruiterVerificationBadge trustInfo={match.job_details.recruiter_verification} />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.match_highlights?.map((highlight: string) => (
                            <Badge key={highlight} variant="secondary" className="bg-secondary text-secondary-foreground">
                              {highlight}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.job_details.location || "Remote"}
                          </div>
                          {match.job_details.salary_range && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {match.job_details.salary_range}
                            </div>
                          )}
                          <div className="text-xs">Match updated {new Date(match.updated_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">{Math.round(match.match_score)}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={async () => {
                              try {
                                const data = await compare(match.job_details.id)
                                setComparisons(prev => ({ ...prev, [match.id]: data }))
                              } catch (err) {
                                console.error("Compare error:", err)
                              }
                            }}
                          >
                            Check Other Resumes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={() =>
                              setSaved(saved.includes(match.id) ? saved.filter((id) => id !== match.id) : [...saved, match.id])
                            }
                          >
                            <Heart className={`w-4 h-4 ${saved.includes(match.id) ? "fill-current text-accent" : ""}`} />
                          </Button>
                          <Button
                            className="btn-primary"
                            size="sm"
                            onClick={async () => {
                              try {
                                await apply({ jobId: match.job_details.id })
                                toast({
                                  title: "Application Sent",
                                  description: `You've successfully applied for ${match.job_details.title} at ${match.job_details.company_name}`,
                                })
                              } catch (err: any) {
                                toast({
                                  title: "Application Failed",
                                  description: err.response?.data?.detail || "Something went wrong",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                    {comparisons[match.id] && (
                      <div className="mt-6 pt-6 border-t border-border space-y-4">
                        <h4 className="text-sm font-bold text-foreground">Match Comparison for all your resumes:</h4>
                        <div className="grid gap-3">
                          {comparisons[match.id].map((comp: any) => (
                            <div key={comp.resume_id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-foreground">{comp.resume_title}</span>
                                {comp.is_primary && <Badge className="text-[8px] h-4">Primary</Badge>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-accent">{Math.round(comp.match_score)}%</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Score</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[10px] hover:bg-accent/10 hover:text-accent"
                                  onClick={async () => {
                                    try {
                                      await apply({ jobId: match.job_details.id, resumeId: comp.resume_id })
                                      toast({
                                        title: "Application Sent",
                                        description: `Applied using ${comp.resume_title} with ${Math.round(comp.match_score)}% match!`,
                                      })
                                    } catch (err: any) {
                                      toast({
                                        title: "Application Failed",
                                        description: err.response?.data?.detail || "Something went wrong",
                                        variant: "destructive",
                                      })
                                    }
                                  }}
                                >
                                  Apply With This
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
