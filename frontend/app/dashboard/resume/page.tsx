"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Sparkles, Briefcase, Settings, Download, Edit2, Trash2, History, Share2, Clock } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Applications", href: "/dashboard/applications", icon: <Clock className="w-5 h-5" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ResumeVersionsDialog } from "@/components/resume-versions-dialog"
import { ResumeShareDialog } from "@/components/resume-share-dialog"
import { ResumeUploadDialog } from "@/components/resume-upload-dialog"
import { Plus } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function ResumePage() {
  const { toast } = useToast()
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog state
  const [versionsResumeId, setVersionsResumeId] = useState<string | null>(null)
  const [shareResumeId, setShareResumeId] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const fetchResumes = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/resumes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Resume data received:", data)
        // Handle both direct array and paginated response
        if (Array.isArray(data)) {
          setResumes(data)
        } else if (data && Array.isArray(data.results)) {
          setResumes(data.results)
        } else {
          setResumes([])
        }
      } else if (response.status === 401) {
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Resume deleted",
          description: "Your resume has been deleted successfully.",
        })
        setResumes((prev) => prev.filter((r) => r.id !== id))
      } else {
        toast({
          title: "Error",
          description: "Failed to delete resume",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <SidebarNav items={navItems} title="Candidate" subtitle="My Resume" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Resumes</h1>
              <p className="text-muted-foreground">Manage and optimize your resumes</p>
            </div>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Upload New
            </Button>
          </div>

          <div className="space-y-4">
            {resumes.length === 0 ? (
              <Card className="border border-border bg-card p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No resumes yet</h3>
                  <p className="text-muted-foreground">Upload your first resume to get started</p>
                </div>
                <Button className="btn-primary" onClick={() => setIsUploadOpen(true)}>Upload Resume</Button>
              </Card>
            ) : (
              Array.isArray(resumes) && resumes.map((resume) => (
                <Card key={resume.id} className="border border-border bg-card p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">{resume.file_name || resume.file.split('/').pop()}</h3>
                        {resume.is_primary && (
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase transition-all duration-300 hover:scale-105 inline-block">Primary</span>
                        )}
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">v{resume.version || 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="hidden md:block text-right">
                        <div className="text-2xl font-bold text-foreground">{resume.ai_score || 0}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                          onClick={() => setVersionsResumeId(resume.id)}
                        >
                          <History className="w-4 h-4" />
                          <span className="hidden sm:inline">History</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                          onClick={() => setShareResumeId(resume.id)}
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                          onClick={async () => {
                            const token = localStorage.getItem("access_token")
                            try {
                              const res = await fetch(`${API_BASE_URL}/resumes/${resume.id}/reanalyze/`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` }
                              })
                              if (res.ok) {
                                toast({ title: "Precision Analysis Done", description: "Score and feedback updated using deep AI." })
                                fetchResumes()
                              }
                            } catch (err) {
                              toast({ title: "Error", description: "Re-analysis failed", variant: "destructive" })
                            }
                          }}
                        >
                          <Sparkles className="w-4 h-4 text-accent" />
                          <span className="hidden sm:inline">Refresh Stats</span>
                        </Button>
                        
                        {/* More dropdown could go here, for now expanded out */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(resume.file, resume.file_name || "resume.pdf")}
                          className="border-border text-foreground hover:bg-muted gap-2 bg-transparent"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resume.id)}
                          className="border-border text-destructive hover:bg-destructive/10 gap-2 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      
      {/* Dialogs */}
      <ResumeVersionsDialog 
        resumeId={versionsResumeId || ""} 
        open={!!versionsResumeId} 
        onOpenChange={(open) => !open && setVersionsResumeId(null)} 
      />
      
      <ResumeShareDialog 
        resumeId={shareResumeId || ""} 
        open={!!shareResumeId} 
        onOpenChange={(open) => !open && setShareResumeId(null)} 
      />

      <ResumeUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
        onSuccess={fetchResumes}
      />
    </div>
  )
}

