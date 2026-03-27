"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, TrendingUp, Search, Info, Layout, Zap, Sparkles } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface ResumeAnalysisProps {
  resumeId?: number
}

export function ResumeAnalysis({ resumeId }: ResumeAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrimaryResume = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      // Don't fetch if we have an explicit resumeId of undefined/null
      if (resumeId === undefined || resumeId === null) {
        setLoading(false)
        setAnalysis(null)
        return
      }

      setLoading(true)
      try {
        const url = resumeId
          ? `${API_BASE_URL}/resumes/${resumeId}/`
          : `${API_BASE_URL}/resumes/primary/`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAnalysis(data)
        } else if (response.status === 404) {
          setAnalysis(null)
        }
      } catch (err) {
        console.error("Failed to fetch primary resume analysis:", err)
        setAnalysis(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPrimaryResume()
  }, [resumeId])

  if (loading) {
    return (
      <Card className="border border-border bg-card p-12 text-center shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground font-medium">Crunching your resume data...</p>
      </Card>
    )
  }

  if (!analysis) return null

  const overallScore = analysis.ai_score || 0
  const analysisRecord = analysis.analysis

  // Ensure metrics is always an array
  let metrics = analysisRecord?.metrics || []
  if (!Array.isArray(metrics)) {
    metrics = []
  }

  // Provide default metrics if empty
  if (metrics.length === 0) {
    metrics = [
      { label: "Keyword Optimization", value: 0, max: 100, status: "warning" },
      { label: "Format Clarity", value: 0, max: 100, status: "warning" },
      { label: "Experience Details", value: 0, max: 100, status: "warning" },
      { label: "Achievement Metrics", value: 0, max: 100, status: "warning" },
    ]
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Section */}
      <Card className="border border-border bg-card p-8 shadow-sm">
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">AI Performance Report</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing: <span className="text-primary font-bold">{analysis.title}</span>
              </p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
              Live Analysis
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Score Circle */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(overallScore / 100) * 465} 465`}
                    strokeLinecap="round"
                    className="text-accent transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black text-foreground tabular-nums">{overallScore}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1">Quality</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h4 className="font-bold text-foreground text-xl flex items-center gap-2 justify-center md:justify-start">
                  <Zap className="w-5 h-5 text-accent" />
                  Expert Feedback
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {analysisRecord?.analysis_text || "Your resume has been successfully parsed. Review the detailed metrics and improvements below to increase your hiring chances."}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                  <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase text-muted-foreground">{analysis.experience_level} LEVEL</span>
                  <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase text-muted-foreground">{analysis.file_type} FORMAT</span>
                </div>
              </div>
            </div>

            {/* Right: Metrics Bars */}
            <div className="space-y-5 py-2">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                Scoring Breakdown
              </h4>
              <div className="space-y-5">
                {metrics.map((metric: any) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {metric.status === "good" ? (
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-xs font-bold text-foreground">{metric.label}</span>
                      </div>
                      <span className="text-xs font-black text-muted-foreground">{metric.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 delay-300 ${metric.status === "good" ? "bg-accent" : "bg-yellow-500"
                          }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Strengths */}
        <Card className="border border-border bg-card p-8 shadow-sm hover:border-accent/40 transition-colors group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-bold text-foreground text-lg">Top Strengths</h4>
          </div>
          <ul className="space-y-4">
            {analysisRecord?.strengths?.length > 0 ? (
              analysisRecord.strengths.map((strength: string, idx: number) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground italic">No specific strengths identified yet.</li>
            )}
          </ul>
        </Card>

        {/* Improvements */}
        <Card className="border border-border bg-card p-8 shadow-sm hover:border-destructive/40 transition-colors group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <h4 className="font-bold text-foreground text-lg">Growth Areas</h4>
          </div>
          <ul className="space-y-4">
            {analysisRecord?.weaknesses?.length > 0 ? (
              analysisRecord.weaknesses.map((weakness: string, idx: number) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{weakness}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground italic text-accent font-medium">Phenomenal! Your resume is highly optimized.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Actionable Suggestions */}
      <Card className="border border-accent/20 bg-accent/5 p-8 border-l-8 border-l-accent shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-black text-foreground text-xl mb-1">Impactful Suggestions</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Recommended Actions</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {analysisRecord?.suggestions?.length > 0 ? (
                analysisRecord.suggestions.map((suggestion: string, idx: number) => (
                  <div key={idx} className="p-4 bg-background/50 rounded-xl border border-border/50 text-sm text-foreground flex gap-3 shadow-inner">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-accent">
                      {idx + 1}
                    </div>
                    <p className="leading-relaxed">{suggestion}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic col-span-2">Refresh your analysis to generate suggestions.</p>
              )}
            </div>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute top-[-20px] right-[-20px] opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-accent" />
        </div>
      </Card>
    </div>
  )
}
