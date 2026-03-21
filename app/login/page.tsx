"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Starting login with email:", email)

    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      console.log("[v0] Login response status:", response.status)

      const data = await response.json()
      console.log("[v0] Login response:", data)

      if (response.ok) {
        // Save tokens and user info
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)
        localStorage.setItem("user_type", data.user.user_type)
        localStorage.setItem("user_id", data.user.id)

        console.log("[v0] Login successful, redirecting to:", data.user.user_type)

        // Redirect based on user type
        const redirectUrl = data.user.user_type === "recruiter" ? "/recruiter/dashboard" : "/dashboard"
        window.location.href = redirectUrl
      } else {
        setError(data.detail || "Invalid email or password")
        console.log("[v0] Login error:", data)
      }
    } catch (err) {
      console.log("[v0] Error:", err)
      setError("Failed to connect to server. Make sure Django backend is running on http://localhost:8000")
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
        localStorage.setItem("user_type", data.user.user_type)
        window.location.href = data.user.user_type === "candidate" ? "/dashboard" : "/recruiter/dashboard"
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
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your account</p>
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
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
              <div className="flex justify-center w-full [&>div]:w-full relative">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  width="100%"
                  theme="outline"
                  shape="rectangular"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="text-accent font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
