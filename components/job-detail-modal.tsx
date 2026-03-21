"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, DollarSign, Users, Clock, Share2 } from "lucide-react"

interface JobDetailModalProps {
  isOpen: boolean
  onClose: () => void
  job: {
    id: number
    title: string
    company: string
    logo?: string
    location: string
    salary: string
    matchScore: number
    description: string
    requirements: string[]
    benefits: string[]
    tags: string[]
    posted: string
    applicants: number
  }
}

export function JobDetailModal({ isOpen, onClose, job }: JobDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="border border-border bg-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-border p-6 flex items-center justify-between bg-card">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
            <p className="text-muted-foreground">{job.company}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Score */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="text-right flex-1">
              <div className="text-3xl font-bold text-accent">{job.matchScore}%</div>
              <div className="text-xs text-muted-foreground">Your Match Score</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex-1">
              <p className="text-sm text-foreground">
                Your skills align well with this position. We recommend applying!
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </p>
              <p className="font-medium text-foreground">{job.location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Salary
              </p>
              <p className="font-medium text-foreground">{job.salary}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Posted
              </p>
              <p className="font-medium text-foreground">{job.posted}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Applicants
              </p>
              <p className="font-medium text-foreground">{job.applicants}</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} className="bg-accent text-accent-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-foreground mb-3">About The Role</h3>
            <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req) => (
                <li key={req} className="flex gap-2 text-sm text-foreground">
                  <span className="text-accent font-bold">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Benefits</h3>
            <ul className="space-y-2">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm text-foreground">
                  <span className="text-accent font-bold">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button className="btn-primary flex-1 gap-2">Apply Now</Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-muted gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
