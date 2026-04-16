"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, File, Check } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface ResumeUploadProps {
  onUploadSuccess?: () => void
  hasResume?: boolean
  resumeId?: number
  defaultPrimary?: boolean
}

export function ResumeUpload({ onUploadSuccess, hasResume, resumeId, defaultPrimary = true }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(hasResume || false)
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [resumeData, setResumeData] = useState<any>(null)

  useEffect(() => {
    setUploaded(hasResume || false)
  }, [hasResume])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleRemovePrimary = async () => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken || !resumeId) return

    try {
      const deleteRes = await fetch(`${API_BASE_URL}/resumes/${resumeId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (deleteRes.ok) {
        setUploaded(false)
        setScore(null)
        setResumeData(null)
        if (onUploadSuccess) onUploadSuccess()
      }
    } catch (err) {
      console.error("Failed to remove resume:", err)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        setError("Please login first")
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name.split(".")[0])
      formData.append("is_primary", defaultPrimary.toString())

      const response = await fetch(`${API_BASE_URL}/resumes/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setScore(data.ai_score)
        setResumeData(data)
        setUploading(false)
        setUploaded(true)
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setError(data.error || data.detail || "Upload failed")
        setUploading(false)
      }
    } catch (err) {
      setError("Failed to upload. Make sure Django backend is running.")
      setUploading(false)
    }
  }

  return (
    <Card className="border border-border bg-card p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Resume Management</h3>
            <p className="text-xs text-muted-foreground">Upload your resume for AI analysis and job matching</p>
          </div>
          {uploaded && (
            <Button variant="outline" size="sm" onClick={handleRemovePrimary} className="text-destructive border-destructive/20 hover:bg-destructive/10">
              Remove Resume
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm italic">
            {error}
          </div>
        )}

        {!file && !uploaded && (
          <div className="group border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-accent transition-all cursor-pointer bg-muted/5">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="sr-only"
              id="resume-input"
            />
            <label htmlFor="resume-input" className="cursor-pointer block">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-accent transition-colors" />
              <p className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs">Drop your professional resume</p>
              <p className="text-[10px] text-muted-foreground uppercase">Supports PDF, DOC, DOCX up to 5MB</p>
            </label>
          </div>
        )}

        {file && !uploaded && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <File className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Ready to analyze</p>
              </div>
              <button onClick={() => setFile(null)} className="p-2 hover:bg-destructive/10 rounded-full transition-colors group">
                <Check className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
              </button>
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="btn-primary w-full shadow-lg shadow-accent/20">
              {uploading ? (
                <span className="flex items-center gap-2 italic">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  AI Processing...
                </span>
              ) : "Start AI Analysis"}
            </Button>
          </div>
        )}

        {uploaded && (
          <div className="p-6 bg-accent/5 rounded-xl border border-accent/20 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">Analysis Complete</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Your dashboard has been updated</p>
              </div>
            </div>

            {score !== null && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time Score</span>
                  <span className="text-4xl font-black text-accent tabular-nums">{score}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
