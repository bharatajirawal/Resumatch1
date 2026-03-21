"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
          {!submitted ? (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
                <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
              </div>

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

                <Button type="submit" className="btn-primary w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Check Your Email</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to {email}. Check your email and follow the instructions to reset your
                password.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}

          {submitted && (
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          )}
        </Card>

        {/* Back to Login */}
        {!submitted && (
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Remember your password? </span>
            <Link href="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
