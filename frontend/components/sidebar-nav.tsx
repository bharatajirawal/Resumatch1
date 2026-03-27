"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

interface SidebarNavProps {
  items: NavItem[]
  title: string
  subtitle?: string
}

export function SidebarNav({ items, title, subtitle }: SidebarNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const handleSignOut = () => {

    localStorage.clear()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 z-40",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border space-y-1 mt-12 md:mt-0">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">RM</span>
            </div>
            <span className="font-bold text-foreground">ResuMatch</span>
          </Link>
          <h2 className="font-bold text-lg text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
                onClick={() => setOpen(false)}
              >
                <span className="w-5 h-5">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">{item.badge}</span>
                )}
              </button>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full border-border text-foreground hover:bg-muted gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setOpen(false)} />}
    </>
  )
}
