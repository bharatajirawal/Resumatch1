"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { JobFilter } from "@/components/job-filter"
import { JobDetailModal } from "@/components/job-detail-modal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Sparkles, Briefcase, Settings, MapPin, DollarSign, Heart, ExternalLink } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "My Resume", href: "/dashboard/resume", icon: <Sparkles className="w-5 h-5" /> },
  { label: "Job Matches", href: "/dashboard/matches", icon: <Briefcase className="w-5 h-5" />, badge: "12" },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
]

const allJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    salary: "$150K - $200K",
    matchScore: 95,
    tags: ["React", "Node.js", "TypeScript"],
    posted: "2 days ago",
    applicants: 45,
    description:
      "We are looking for an experienced Senior Software Engineer to join our growing team. You will work on cutting-edge projects and lead technical initiatives.",
    requirements: [
      "5+ years of software development experience",
      "Strong proficiency in React and Node.js",
      "Experience with TypeScript and modern web technologies",
      "Leadership and mentoring skills",
      "Experience with cloud platforms (AWS, GCP)",
    ],
    benefits: [
      "Competitive salary and equity",
      "Health insurance and 401(k)",
      "Flexible work arrangements",
      "Professional development budget",
      "Unlimited PTO",
    ],
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
    applicants: 32,
    description:
      "Join our fast-growing startup as a Full Stack Developer. You will have the opportunity to work on diverse projects and impact our product direction.",
    requirements: [
      "3+ years of full-stack development experience",
      "Proficiency in React and Python",
      "AWS experience",
      "Strong problem-solving skills",
      "Excellent communication skills",
    ],
    benefits: [
      "Competitive salary and stock options",
      "Health and wellness benefits",
      "Work from home flexibility",
      "Learning and development opportunities",
      "Team outings and events",
    ],
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
    applicants: 28,
    description:
      "We are seeking a talented Frontend Engineer to create beautiful and intuitive user interfaces. Work on projects that matter and grow your skills.",
    requirements: [
      "3+ years of frontend development",
      "Strong React skills",
      "CSS and HTML mastery",
      "UI/UX principles knowledge",
      "Git proficiency",
    ],
    benefits: [
      "Competitive compensation",
      "Remote-first culture",
      "Health insurance",
      "Annual bonus",
      "Conference attendance budget",
    ],
  },
]

export default function DetailedMatchesPage() {
  const [saved, setSaved] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<(typeof allJobs)[0] | null>(null)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav items={navItems} title="Candidate" subtitle="Job Matches" />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          <div className="pt-12 md:pt-0">
            <h1 className="text-4xl font-bold text-foreground mb-2">Job Matches - Detailed View</h1>
            <p className="text-muted-foreground">Explore and filter personalized job opportunities</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <JobFilter
                onFilter={(filters) => {
                  console.log("Applying filters:", filters)
                }}
              />
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-3 space-y-4">
              {allJobs.map((job) => (
                <Card
                  key={job.id}
                  className="border border-border bg-card p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{job.company}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-secondary text-secondary-foreground text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </div>
                          <div className="text-xs">{job.posted}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">{job.matchScore}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-foreground hover:bg-muted bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSaved(
                                saved.includes(job.id) ? saved.filter((id) => id !== job.id) : [...saved, job.id],
                              )
                            }}
                          >
                            <Heart className={`w-4 h-4 ${saved.includes(job.id) ? "fill-current text-accent" : ""}`} />
                          </Button>
                          <Button
                            className="btn-primary gap-2"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedJob(job)
                            }}
                          >
                            View
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && <JobDetailModal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} job={selectedJob} />}
    </div>
  )
}
