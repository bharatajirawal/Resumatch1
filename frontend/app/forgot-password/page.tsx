"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/password_reset_request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStep(2)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the reset code.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to send reset link",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/password_reset_confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      })

      if (response.ok) {
        setStep(3)
        toast({
          title: "Success!",
          description: "Your password has been reset successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Invalid Request",
          description: data.error || "Invalid OTP or request expired.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-zinc-950">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter mt-4">ResuMatch</h1>
        </div>

        <Card className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-indigo-600" />
          
          {step === 1 && (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
                <p className="text-zinc-400 text-sm">No worries, it happens. Enter your email to receive a reset code.</p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-950/50 border-zinc-800 pl-10 h-11 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 font-bold transition-all transform active:scale-[0.98]">
                  {loading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Verify OTP</h2>
                <p className="text-zinc-400 text-sm">We've sent a 6-digit code to <b>{email}</b></p>
              </div>

              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">6-Digit Code</label>
                   <Input
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="bg-zinc-950/50 border-zinc-800 h-11 text-center text-lg font-mono tracking-widest"
                    />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">New Password</label>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-zinc-950/50 border-zinc-800 pl-10 h-11"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 bg-accent hover:bg-accent/90 font-bold">
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Password Reset!</h3>
                <p className="text-zinc-400 text-sm">Your password has been updated. You can now securely sign in.</p>
              </div>
              <Link href="/login" className="block">
                <Button className="w-full h-11 bg-primary hover:bg-primary/90 font-bold">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          )}

          {step < 3 && (
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-foreground transition-colors pt-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          )}
        </Card>
      </div>
    </div>
  )
}
