"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Trash2, ShieldCheck, Clock } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface ShareLink {
  id: number
  share_id: string
  is_public: boolean
  is_active: boolean
  expires_at: string | null
  view_count: number
  share_url: string
}

interface ResumeShareDialogProps {
  resumeId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumeShareDialog({ resumeId, open, onOpenChange }: ResumeShareDialogProps) {
  const { toast } = useToast()
  const [links, setLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  // Settings for new link
  const [isPublic, setIsPublic] = useState(true)
  const [expiresIn, setExpiresIn] = useState("0") // "0" means never

  const fetchLinks = async () => {
    setLoading(true)
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/share/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (err) {
      console.error("Failed to fetch share links:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && resumeId) {
      fetchLinks()
    }
  }, [open, resumeId])

  const createLink = async () => {
    setIsCreating(true)
    const token = localStorage.getItem("access_token")
    
    const body: any = { is_public: isPublic }
    if (expiresIn !== "0") {
      body.expires_hours = parseInt(expiresIn)
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/share/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        toast({ title: "Share link created", description: "You can now share your resume." })
        fetchLinks()
      } else {
        toast({ title: "Error", description: "Failed to create share link", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const revokeLink = async (shareId: string) => {
    if (!confirm("Are you sure you want to revoke this link? Anyone with the link will lose access.")) return;
    
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/share/${shareId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast({ title: "Link revoked", description: "The share link has been disabled." })
        fetchLinks()
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to revoke link", variant: "destructive" })
    }
  }

  const copyToClipboard = (urlPath: string) => {
    const fullUrl = `${window.location.origin}${urlPath}`
    navigator.clipboard.writeText(fullUrl)
    toast({ title: "Copied!", description: "Link copied to clipboard." })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Resume
          </DialogTitle>
          <DialogDescription>
            Create public or private links to share your resume and AI analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Create New Link Section */}
          <div className="bg-muted p-4 rounded-lg space-y-4 border border-border">
            <h4 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
              Generate New Link
            </h4>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Access</Label>
                  <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  Expiration
                </Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                >
                  <option value="0">Never expires</option>
                  <option value="24">24 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">1 week</option>
                  <option value="720">1 month</option>
                </select>
              </div>

              <Button className="w-full mt-2" onClick={createLink} disabled={isCreating}>
                {isCreating ? "Generating..." : "Generate Share Link"}
              </Button>
            </div>
          </div>

          {/* Existing Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Active Links</h4>
            
            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
            ) : links.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg bg-card/50">
                No active share links. Generate one above.
              </div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2">
                {links.map(link => (
                  <div key={link.id} className="p-3 border rounded-lg bg-card/40 hover:bg-card/80 transition-colors flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={link.is_public ? "default" : "secondary"}>
                          {link.is_public ? "Public" : "Private"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {link.expires_at ? `Expires: ${new Date(link.expires_at).toLocaleDateString()}` : "No expiry"}
                        </span>
                      </div>
                      <div className="text-xs font-mono bg-muted px-2 py-1 rounded border">
                        {link.view_count} views
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        value={`${window.location.origin}${link.share_url}`} 
                        readOnly 
                        className="h-8 text-xs font-mono bg-muted/50" 
                      />
                      <Button size="icon" variant="secondary" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(link.share_url)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 shrink-0 hover:bg-destructive/90"
                        onClick={() => revokeLink(link.share_id)}
                        title="Revoke link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
