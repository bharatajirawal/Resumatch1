"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Briefcase, Settings, Sparkles, Clock, CheckCircle2, XCircle, Calendar, MessageSquare, MapPin } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Applications", href: "/dashboard/applications", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function ApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/jobs/my-applications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        } else if (response.status === 401) {
          window.location.href = "/login"
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err)
        toast({ title: "Error", description: "Could not load applications", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [toast])

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return { color: "bg-blue-500/10 text-blue-500", icon: <Clock className="w-4 h-4" />, label: "Applied" }
      case 'reviewed': return { color: "bg-purple-500/10 text-purple-500", icon: <Eye className="w-4 h-4" />, label: "Under Review" }
      case 'shortlisted': return { color: "bg-amber-500/10 text-amber-500", icon: <Star className="w-4 h-4" />, label: "Shortlisted" }
      case 'interview': return { color: "bg-indigo-500/10 text-indigo-500", icon: <Calendar className="w-4 h-4" />, label: "Interview" }
      case 'accepted': return { color: "bg-emerald-500/10 text-emerald-500", icon: <CheckCircle2 className="w-4 h-4" />, label: "Accepted" }
      case 'rejected': return { color: "bg-red-500/10 text-red-500", icon: <XCircle className="w-4 h-4" />, label: "Rejected" }
      default: return { color: "bg-gray-500/10 text-gray-500", icon: <Clock className="w-4 h-4" />, label: status }
    }
  }

  // Define Eye and Star locally to avoid import issues if they aren't used elsewhere
  const Eye = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
  const Star = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Applications Tracker" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-muted-foreground">Track the status of your sent job applications</p>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 w-1/2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <Card className="border border-border bg-card p-12 text-center border-dashed">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet. Start exploring and applying!</p>
                <Button className="btn-primary" onClick={() => window.location.href = '/dashboard/matches'}>Browse Jobs</Button>
              </Card>
            ) : (
              applications.map((app) => {
                const conf = getStatusConfig(app.status)
                return (
                  <Card key={app.id} className="border border-border bg-card overflow-hidden">
                    <div className="p-6 md:flex md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{app.job_title}</h3>
                            <p className="text-lg text-muted-foreground">{app.company_name}</p>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold md:hidden ${conf.color}`}>
                            {conf.icon} {conf.label}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Match Score: <strong className="text-foreground">{Math.round(app.match_score)}%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-end gap-3">
                        <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${conf.color}`}>
                          {conf.icon} {conf.label}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.location.href = `/jobs/${app.job_id}`}>
                          View Job Detail
                        </Button>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-muted/30 border-t p-6 pb-8">
                      <h4 className="text-sm font-bold mb-6">Application Tracker</h4>
                      
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute top-2.5 left-2 bg-border w-0.5 h-[calc(100%-1.5rem)] -z-10" />
                        
                        <div className="space-y-6">
                          {app.status_history && app.status_history.map((history: any, idx: number) => {
                            const hConf = getStatusConfig(history.new_status)
                            const isLatest = idx === 0
                            
                            return (
                              <div key={history.id} className="flex gap-4">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-4 border-background ${
                                  isLatest ? hConf.color.split(' ')[1].replace('text-', 'bg-') : 'bg-muted-foreground/30'
                                }`}>
                                  {isLatest && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div className="-mt-1">
                                  <div className="flex items-baseline gap-2">
                                    <h5 className={`font-semibold text-sm ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {hConf.label}
                                    </h5>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(history.changed_at).toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  {history.note && (
                                    <div className="mt-2 text-sm bg-background border rounded-md p-3 text-muted-foreground flex gap-2 items-start">
                                      <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                      <p>{history.note}</p>
                                    </div>
                                  )}

                                  {/* Render Interview Details if scheduling occurred here */}
                                  {history.new_status === 'interview' && app.interviews?.length > 0 && isLatest && (
                                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded-md p-4 space-y-3">
                                      <h6 className="font-bold text-sm text-primary flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Upcoming Interview
                                      </h6>
                                      
                                      {app.interviews.filter((i:any) => i.status !== 'cancelled').map((interview: any) => (
                                        <div key={interview.id} className="grid sm:grid-cols-2 gap-3 text-sm">
                                          <div>
                                            <span className="text-muted-foreground text-xs block mb-0.5">When</span>
                                            <strong className="text-foreground">{new Date(interview.scheduled_at).toLocaleString()}</strong>
                                            <p className="text-xs text-muted-foreground">{interview.duration_minutes} minutes</p>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground text-xs block mb-0.5">Where</span>
                                            <div className="flex items-start gap-1">
                                              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                              <span>{interview.location || 'TBA'}</span>
                                            </div>
                                          </div>
                                          {interview.notes && (
                                            <div className="sm:col-span-2 mt-1 border-t border-primary/10 pt-2">
                                              <span className="text-muted-foreground text-xs block mb-0.5">Instructions</span>
                                              <p>{interview.notes}</p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
