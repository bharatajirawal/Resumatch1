import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">RM</span>
            </div>
            <span className="font-bold text-lg text-foreground">ResuMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                  Match Your Resume to Your Dream Job
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  AI-powered resume analysis and intelligent job matching. Get matched with opportunities that align
                  with your skills and experience.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?type=candidate">
                  <Button size="lg">
                    For Candidates
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/register?type=recruiter">
                  <Button variant="secondary" size="lg">
                    For Recruiters
                  </Button>
                </Link>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">AI-powered resume analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">Intelligent job matching algorithm</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">Real-time notifications</span>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="relative h-96 md:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-card border border-border rounded-2xl p-8 space-y-6 max-w-sm">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="space-y-3 pt-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                </div>
                <div className="pt-2 h-8 bg-gradient-to-r from-primary to-accent rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ResuMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
