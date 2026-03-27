"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface InterviewSchedulingDialogProps {
  applicationId: number | string
  candidateName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InterviewSchedulingDialog({ applicationId, candidateName, open, onOpenChange, onSuccess }: InterviewSchedulingDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("45")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time || !duration) {
      toast({ title: "Error", description: "Date, time, and duration are required.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    const token = localStorage.getItem("access_token")

    // Combine date and time for scheduled_at
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/applications/${applicationId}/schedule-interview/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          interview_type: location.includes('http') ? 'video' : 'in_person',
          scheduled_at: scheduledAt,
          duration_minutes: parseInt(duration),
          location: location,
          notes: notes
        })
      })

      if (response.ok) {
        toast({ title: "Interview Scheduled", description: `An interview has been scheduled with ${candidateName}.` })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        const errData = await response.json()
        toast({ title: "Failed to schedule", description: errData.error || errData.detail || "Unknown error occurred", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Interview
          </DialogTitle>
          <DialogDescription>
            Set up an interview with <strong>{candidateName}</strong>. They will be notified automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duration (minutes)</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={duration} 
              onChange={e => setDuration(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location or Meeting Link</Label>
            <Input 
              placeholder="e.g. Google Meet link or Conference Room A" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Notes / Instructions for Candidate</Label>
            <Textarea 
              placeholder="e.g. Please bring a copy of your resume..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              className="resize-none"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
