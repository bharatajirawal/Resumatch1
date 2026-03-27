"use client"

import { RecruiterSidebar } from "@/components/recruiter-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { BarChart3, Briefcase, Users, Settings, Star, MessageSquare, CheckCircle, XCircle, Calendar, Filter } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Job Postings", href: "/recruiter/jobs", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Candidates", href: "/recruiter/candidates", icon: <Users className="w-5 h-5" /> },
  { label: "Settings", href: "/recruiter/settings", icon: <Settings className="w-5 h-5" /> },
]

import { useState, useEffect, useMemo } from "react"
import { InterviewSchedulingDialog } from "@/components/interview-scheduling-dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function CandidatesPage() {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [minScore, setMinScore] = useState("")

  // Dialog State
  const [interviewAppId, setInterviewAppId] = useState<number | null>(null)
  const [interviewCandidateName, setInterviewCandidateName] = useState("")

  const fetchCandidates = async () => {
    setLoading(true)
    const token = localStorage.getItem("access_token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/my_jobs/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const jobsList = Array.isArray(data) ? data : (data?.results || [])
        setJobs(jobsList)

        const allApps: any[] = []
        jobsList.forEach((job: any) => {
          if (job.applications) {
            job.applications.forEach((app: any) => {
              allApps.push({
                ...app,
                jobTitle: job.title,
                jobId: job.id
              })
            })
          }
        })
        setCandidates(allApps)
      }
    } catch (err) {
      console.error("Candidates fetch error:", err)
      toast({ title: "Error", description: "Failed to load candidates", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (jobFilter !== "all" && c.jobId.toString() !== jobFilter) return false
      if (minScore && c.match_score < parseInt(minScore)) return false
      return true
    }).sort((a, b) => b.match_score - a.match_score)
  }, [candidates, statusFilter, jobFilter, minScore])

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c.id)))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return
    setIsProcessing(true)
    const token = localStorage.getItem("access_token")
    
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/bulk-action/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: Array.from(selectedIds),
          action: action
        })
      })

      if (response.ok) {
        toast({ title: "Success", description: `Candidates ${action}ed successfully.` })
        setSelectedIds(new Set())
        fetchCandidates()
      } else {
        toast({ title: "Error", description: "Failed to perform action.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return "bg-emerald-500/10 text-emerald-500"
      case 'rejected': return "bg-red-500/10 text-red-500"
      case 'shortlisted': return "bg-amber-500/10 text-amber-500"
      case 'interview': return "bg-indigo-500/10 text-indigo-500"
      default: return "bg-secondary text-secondary-foreground"
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
      <RecruiterSidebar items={navItems} title="Recruiter" subtitle="Candidates" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="pt-12 md:pt-0 flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Candidates</h1>
              <p className="text-muted-foreground">Review, filter, and manage applicants</p>
            </div>
            
            {/* Bulk Actions */}
            <div className={`flex items-center gap-2 transition-opacity flex-wrap ${selectedIds.size > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <span className="text-sm font-medium mr-2">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleBulkAction('accept')} disabled={isProcessing}>
                <CheckCircle className="w-4 h-4 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => handleBulkAction('shortlist')} disabled={isProcessing}>
                <Star className="w-4 h-4 mr-1" /> Shortlist
              </Button>
              <Button size="sm" variant="outline" className="border-indigo-500/50 text-indigo-500 hover:bg-indigo-500/10" onClick={() => handleBulkAction('review')} disabled={isProcessing}>
                <MessageSquare className="w-4 h-4 mr-1" /> Reviewed
              </Button>
              <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => handleBulkAction('reject')} disabled={isProcessing}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-card border rounded-lg p-4 flex flex-wrap gap-4 items-end shadow-sm">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-3 h-3"/> Job Posting</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={jobFilter} onChange={e => setJobFilter(e.target.value)}>
                <option value="all">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5 w-[180px]">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Filter className="w-3 h-3"/> Status</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="applied">New / Applied</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="space-y-1.5 w-[180px]">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Star className="w-3 h-3"/> Min Score (%)</label>
              <Input type="number" placeholder="e.g. 80" value={minScore} onChange={e => setMinScore(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <Card className="border border-border bg-card p-12 text-center text-muted-foreground border-dashed">
                No candidates match your filters.
              </Card>
            ) : (
              <>
                <div className="flex items-center gap-2 px-6 py-2">
                  <Checkbox 
                    checked={selectedIds.size > 0 && selectedIds.size === filteredCandidates.length} 
                    onCheckedChange={toggleSelectAll} 
                  />
                  <span className="text-sm text-muted-foreground font-medium">Select All</span>
                </div>
                
                {filteredCandidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className={`border transition-all duration-200 ${selectedIds.has(candidate.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/50'}`}
                  >
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      <div className="flex items-start gap-4 flex-1 w-full">
                        <Checkbox 
                          checked={selectedIds.has(candidate.id)} 
                          onCheckedChange={() => toggleSelect(candidate.id)} 
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0">
                          {candidate.candidate_name.charAt(0).toUpperCase() || '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-foreground truncate">{candidate.candidate_name}</h3>
                          <p className="text-sm text-muted-foreground mb-1 truncate">{candidate.candidate_email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground truncate max-w-[200px] border border-border">
                              {candidate.jobTitle}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(candidate.status)}`}>
                              {candidate.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pl-14 sm:pl-0">
                        <div className="text-center">
                          <div className="text-3xl font-black text-foreground">
                            {candidate.match_score !== null ? Math.round(candidate.match_score) : '-'}
                            <span className="text-sm font-normal text-muted-foreground ml-0.5">%</span>
                          </div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Match Score</div>
                        </div>

                        <div className="flex gap-2 flex-wrap shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-transparent"
                            onClick={() => {
                              setInterviewAppId(candidate.id)
                              setInterviewCandidateName(candidate.candidate_name)
                            }}
                          >
                            <Calendar className="w-4 h-4 text-indigo-400 mr-2 hover:text-indigo-500" />
                            Schedule
                          </Button>
                          <Link href={`/recruiter/candidates/${candidate.candidate}`}>
                            <Button className="btn-primary" size="sm">
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Dialog */}
      <InterviewSchedulingDialog 
        applicationId={interviewAppId || ""} 
        candidateName={interviewCandidateName}
        open={!!interviewAppId}
        onOpenChange={(open) => !open && setInterviewAppId(null)}
        onSuccess={fetchCandidates}
      />
    </div>
  )
}

