"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase, 
  Building2, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  Linkedin,
  Users,
  Calendar,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function JobPostingForm({
  onSubmit,
  initialData,
  isEditing = false,
}: {
  onSubmit: (data: any) => void
  initialData?: any
  isEditing?: boolean
}) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [recruiterTrust, setRecruiterTrust] = useState<any>(null)

  const [formData, setFormData] = useState({
    // Step 1: Basics
    title: initialData?.title || "",
    location: initialData?.location || "",
    jobType: initialData?.employment_type || "full-time",
    experienceLevel: initialData?.experience_level || "entry",
    category: initialData?.category || "Software Development",
    
    // Step 2: Company
    companyName: initialData?.company_name || "",
    companyWebsite: initialData?.company_website || "",
    linkedinUrl: initialData?.linkedin_url || "",
    industry: initialData?.industry || "",
    companySize: initialData?.company_size || "",

    // Step 3: Content
    description: initialData?.description || "",
    about_role: initialData?.about_role || "",
    responsibilities: initialData?.responsibilities || [],
    requirements: initialData?.requirements || [],
    nice_to_have: initialData?.nice_to_have || [],
    benefits: initialData?.benefits || [],

    // Step 4: Salary & Skills
    salary_min: initialData?.salary_min || "",
    salary_max: initialData?.salary_max || "",
    salary_currency: initialData?.salary_currency || "INR",
    salary_type: initialData?.salary_type || "CTC",
    skills: initialData?.skills_required || [],
  })

  // Mock trust score for now (backend would provide this)
  useEffect(() => {
    const fetchTrust = async () => {
      // In a real app, fetch from GET /api/users/recruiter-profile/
      setRecruiterTrust({
        score: 65,
        badge: "Partially Verified",
        color: "yellow",
        verifications: {
          email: true,
          domain: false,
          linkedin: true,
          proof: false
        }
      })
    }
    fetchTrust()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (name: string, value: string) => {
    const items = value.split("\n").filter(i => i.trim() !== "")
    setFormData((prev) => ({ ...prev, [name]: items }))
  }

  const handleGenerateAI = async () => {
    if (!formData.title) {
      toast({
        title: "Missing Info",
        description: "Please provide a job title first.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/generate-ai-jd/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          title: formData.title,
          experience_level: formData.experienceLevel,
          skills: formData.skills,
          location: formData.location,
          employment_type: formData.jobType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          about_role: data.about_role,
          responsibilities: data.responsibilities,
          requirements: data.requirements,
          nice_to_have: data.nice_to_have,
          benefits: data.benefits,
          description: data.about_role // fallback
        }))
        toast({
          title: "AI Generation Success!",
          description: "We've populated the structured sections for you."
        })
      }
    } catch (err) {
      toast({
        title: "AI Error",
        description: "Could not connect to AI services.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Step {step} of 5</span>
          <span>{Math.round((step / 5) * 100)}% Complete</span>
        </div>
        <Progress value={(step / 5) * 100} className="h-2 bg-zinc-800" />
      </div>

      <Card className="border-border bg-card/40 backdrop-blur-sm p-6 md:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="p-2 w-8 h-8 rounded-lg bg-primary/10 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Job Basics</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input 
                    name="title" 
                    placeholder="e.g. Senior Backend Engineer" 
                    value={formData.title} 
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    name="location" 
                    placeholder="e.g. Remote / New York, NY" 
                    value={formData.location} 
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Mode</label>
                  <select 
                    name="jobType" 
                    value={formData.jobType} 
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience</label>
                  <select 
                    name="experienceLevel" 
                    value={formData.experienceLevel} 
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" value={formData.category} onChange={handleChange} className="bg-zinc-900/50 border-zinc-800" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-2 mb-2">
                <Building2 className="p-2 w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500" />
                <h3 className="text-xl font-bold text-foreground">Company & Verification</h3>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${recruiterTrust?.color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{recruiterTrust?.badge}</p>
                    <p className="text-xs text-muted-foreground">Trust Score: {recruiterTrust?.score}/100</p>
                  </div>
                </div>
                <Badge variant={recruiterTrust?.color === 'green' ? "default" : "secondary"}>
                  {recruiterTrust?.score}% Verified
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex gap-2 items-center">
                    <Globe className="w-4 h-4 text-muted-foreground" /> Company Website
                  </label>
                  <Input name="companyWebsite" placeholder="https://company.com" value={formData.companyWebsite} onChange={handleChange} className="bg-zinc-900/50 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex gap-2 items-center">
                    <Linkedin className="w-4 h-4 text-muted-foreground" /> LinkedIn Profile
                  </label>
                  <Input name="linkedinUrl" placeholder="https://linkedin.com/company/..." value={formData.linkedinUrl} onChange={handleChange} className="bg-zinc-900/50 border-zinc-800" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex gap-2 items-center">
                    <Briefcase className="w-4 h-4 text-muted-foreground" /> Industry
                  </label>
                  <Input name="industry" value={formData.industry} onChange={handleChange} className="bg-zinc-900/50 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex gap-2 items-center">
                    <Users className="w-4 h-4 text-muted-foreground" /> Size
                  </label>
                  <Input name="companySize" placeholder="e.g. 50-100" value={formData.companySize} onChange={handleChange} className="bg-zinc-900/50 border-zinc-800" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium flex gap-2 items-center">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Founded
                  </label>
                  <Input name="foundedYear" placeholder="2020" className="bg-zinc-900/50 border-zinc-800" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row items-end justify-between gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-indigo-400/70 ml-1">AI Position Context</label>
                    <Input 
                      placeholder="e.g. Senior Frontend Developer" 
                      value={formData.title} 
                      onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
                      className="h-9 bg-zinc-950/50 border-indigo-500/20 focus:border-indigo-500/50 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-indigo-400/70 ml-1">Years of Experience</label>
                    <Input 
                      placeholder="e.g. 5+ years" 
                      value={formData.experienceLevel} 
                      onChange={(e) => setFormData(p => ({...p, experienceLevel: e.target.value}))}
                      className="h-9 bg-zinc-950/50 border-indigo-500/20 focus:border-indigo-500/50 text-xs"
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={handleGenerateAI} 
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-500 h-9 transition-all px-6 shadow-lg shadow-indigo-600/20 shrink-0"
                >
                  <Sparkles className={`mr-2 w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">About the Role</label>
                  <Textarea 
                    name="about_role" 
                    value={formData.about_role} 
                    onChange={handleChange} 
                    className="min-h-[120px] bg-zinc-900/50 border-zinc-800"
                    placeholder="Provide a high-level summary..."
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-400">Responsibilities (one per line)</label>
                    <Textarea 
                      value={formData.responsibilities?.join("\n")} 
                      onChange={(e) => handleArrayChange("responsibilities", e.target.value)} 
                      className="min-h-[150px] bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-400">Requirements (one per line)</label>
                    <Textarea 
                      value={formData.requirements?.join("\n")} 
                      onChange={(e) => handleArrayChange("requirements", e.target.value)} 
                      className="min-h-[150px] bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-400">Benefits (one per line)</label>
                    <Textarea 
                      value={formData.benefits?.join("\n")} 
                      onChange={(e) => handleArrayChange("benefits", e.target.value)} 
                      className="min-h-[100px] bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nice to Have (one per line)</label>
                    <Textarea 
                      value={formData.nice_to_have?.join("\n")} 
                      onChange={(e) => handleArrayChange("nice_to_have", e.target.value)} 
                      className="min-h-[100px] bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-2 mb-2">
                <DollarSign className="p-2 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500" />
                <h3 className="text-xl font-bold text-foreground">Salary & Skills</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                <div className="space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Range
                  </label>
                  <div className="flex items-center gap-4">
                    <Input name="salary_min" type="number" placeholder="Min" value={formData.salary_min} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                    <span className="text-muted-foreground">-</span>
                    <Input name="salary_max" type="number" placeholder="Max" value={formData.salary_max} onChange={handleChange} className="bg-zinc-950 border-zinc-800" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold">Details</label>
                  <div className="flex gap-4">
                    <select name="salary_currency" className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 text-sm" value={formData.salary_currency} onChange={handleChange}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 w-full">
                      <button 
                        type="button"
                        onClick={() => setFormData(p => ({...p, salary_type: 'CTC'}))}
                        className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${formData.salary_type === 'CTC' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-zinc-800'}`}
                      >CTC</button>
                      <button 
                        type="button"
                        onClick={() => setFormData(p => ({...p, salary_type: 'In-hand'}))}
                        className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${formData.salary_type === 'In-hand' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-zinc-800'}`}
                      >In-hand</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords / Skills (Enter one per line)</label>
                <Textarea 
                  placeholder="Python\nReact\nNext.js..."
                  className="min-h-[120px] bg-zinc-900/50 border-zinc-800"
                  value={formData.skills?.join("\n")}
                  onChange={(e) => handleArrayChange("skills", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="p-2 w-8 h-8 rounded-lg bg-primary/10 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Preview & Publish</h3>
              </div>

              <div className="border border-zinc-800 rounded-3xl overflow-hidden bg-zinc-950/50 shadow-2xl">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-3xl font-extrabold text-foreground">{formData.title || "Untitled Role"}</h4>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {formData.companyName || "Your Company"}</span>
                        <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {formData.location || "Location Not Set"}</span>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 h-8 px-4 text-xs font-bold uppercase tracking-wider">
                      {formData.jobType}
                    </Badge>
                  </div>

                  <div className="flex gap-2 p-3 bg-zinc-900/50 rounded-2xl w-fit border border-zinc-800">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-zinc-400">Recruiter Verified: <span className="text-zinc-100">{recruiterTrust?.badge}</span></span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Experience</p>
                      <p className="text-sm font-medium">{formData.experienceLevel}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Salary</p>
                      <p className="text-sm font-medium">{formData.salary_min && formData.salary_max ? `${formData.salary_currency} ${formData.salary_min} - ${formData.salary_max}` : 'Not Disclosed'}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Industry</p>
                      <p className="text-sm font-medium">{formData.industry || "General"}</p>
                    </div>
                    <div className="space-y-1 p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800">
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Applicants</p>
                      <p className="text-sm font-medium">0 Expected</p>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none space-y-6">
                    <div>
                      <h5 className="text-lg font-bold text-indigo-400 mb-2">About the Role</h5>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{formData.about_role || formData.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h5 className="text-lg font-bold text-indigo-400 mb-2">Responsibilities</h5>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-400">
                          {formData.responsibilities?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-indigo-400 mb-2">Requirements</h5>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-400">
                          {formData.requirements?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 h-11 border-zinc-800 bg-transparent text-foreground hover:bg-zinc-800 transition-all"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Previous
            </Button>

            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-8 h-11 bg-primary hover:bg-primary/90 transition-all font-bold"
              >
                Next Step <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="px-10 h-11 bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-extrabold shadow-lg shadow-indigo-500/20"
              >
                🚀 Confirm & Publish Job
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Trust Indicator Footer */}
      {step < 5 && recruiterTrust?.score < 40 && (
         <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-xs text-red-200">
              <span className="font-bold">Trust Indicator:</span> Your recruiter profile is currently unverified. Candidates are less likely to apply to unverified postings.
            </p>
         </div>
      )}
    </div>
  )
}
