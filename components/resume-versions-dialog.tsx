"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { History, Copy, ExternalLink, Activity } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface Version {
  id: number
  version_number: number
  title: string
  ai_score: number
  created_at: string
  change_note: string
}

interface ResumeVersionsDialogProps {
  resumeId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumeVersionsDialog({ resumeId, open, onOpenChange }: ResumeVersionsDialogProps) {
  const { toast } = useToast()
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const fetchVersions = async () => {
    setLoading(true)
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/versions/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (err) {
      console.error("Failed to fetch versions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && resumeId) {
      fetchVersions()
    }
  }, [open, resumeId])

  const createVersion = async () => {
    setIsCreating(true)
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/versions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ change_note: "Manual snapshot" })
      })
      if (response.ok) {
        toast({ title: "Version created", description: "A new snapshot of your resume has been saved." })
        fetchVersions()
      } else {
        toast({ title: "Error", description: "Failed to create version", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Resume Version History
          </DialogTitle>
          <DialogDescription>
            View past snapshots and changes to your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Saved Versions</h4>
            <Button size="sm" onClick={createVersion} disabled={isCreating}>
              {isCreating ? "Saving..." : "Save Current Version"}
            </Button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {loading ? (
              <>
                <Skeleton className="h-[80px] w-full" />
                <Skeleton className="h-[80px] w-full" />
              </>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No versions saved yet. Click the button above to create a snapshot.
              </div>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="p-3 border rounded-lg bg-card/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">v{v.version_number}</Badge>
                      <span className="text-sm font-medium">{new Date(v.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Activity className="w-4 h-4" /> Score: <span className="text-foreground font-bold">{v.ai_score}</span>
                    </div>
                  </div>
                  {v.change_note && (
                    <p className="text-xs text-muted-foreground">{v.change_note}</p>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                        window.open(v.file, '_blank')
                    }}>
                      <ExternalLink className="w-3 h-3 mr-1" /> View PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
