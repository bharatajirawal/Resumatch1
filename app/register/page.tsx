"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type") || "candidate"

  const [userType, setUserType] = useState<"candidate" | "recruiter">(typeParam as any)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [showOtp, setShowOtp] = useState(false)
  const [otpValue, setOtpValue] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Starting registration with:", { email: formData.email, userType })

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.name.split(" ")[0],
          last_name: formData.name.split(" ").slice(1).join(" "),
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          user_type: userType,
        }),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (response.ok) {
        // Save tokens to localStorage
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)
        localStorage.setItem("user_type", userType)

        console.log("[v0] Registration successful, showing OTP verification...")
        setShowOtp(true)
      } else {
        setError(data.email?.[0] || data.detail || "Registration failed")
        console.log("[v0] Registration error:", data)
      }
    } catch (err) {
      console.log("[v0] Error:", err)
      setError("Failed to connect to server. Make sure Django backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify_otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          otp: otpValue
        }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = userType === "candidate" ? "/dashboard" : "/recruiter/dashboard"
      } else {
        setError(data.error || "Invalid OTP or OTP expired")
      }
    } catch (err) {
      setError("Failed to verify OTP. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/google_auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          user_type: userType
        }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)
        localStorage.setItem("user_type", userType)
        window.location.href = userType === "candidate" ? "/dashboard" : "/recruiter/dashboard"
      } else {
        setError(data.error || "Google Auth failed")
      }
    } catch (err) {
      setError("Failed to connect to server.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google authentication failed.")
  }

  if (showOtp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-base">RM</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">ResuMatch</h1>
          </div>
          <Card className="border border-border bg-card p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Verify your Email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit OTP to {formData.email}. Note: check your backend server console if you haven't setup an actual email provider in Django.
              </p>
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center flex-col items-center gap-4">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" disabled={loading || otpValue.length !== 6} className="btn-primary w-full">
                {loading ? "Verifying..." : "Verify OTP"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-base">RM</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">ResuMatch</h1>
        </div>

        {/* Form Card */}
        <Card className="border border-border bg-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
              <p className="text-muted-foreground">Join ResuMatch and start matching today</p>
            </div>

            {/* User Type Selection */}
            <div className="flex gap-3">
              <button
                onClick={() => setUserType("candidate")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${userType === "candidate"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
              >
                Candidate
              </button>
              <button
                onClick={() => setUserType("recruiter")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${userType === "recruiter"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
              >
                Recruiter
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account..." : "Create Account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
              <div className="flex justify-center w-full [&>div]:w-full relative">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  width="100%"
                  theme="outline"
                  shape="rectangular"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </Card>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
