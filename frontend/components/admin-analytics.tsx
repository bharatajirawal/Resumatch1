"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { useState, useEffect } from "react"

const userGrowth = [
  { month: "Jan", candidates: 120, recruiters: 45 },
  { month: "Feb", candidates: 180, recruiters: 62 },
  { month: "Mar", candidates: 260, recruiters: 85 },
  { month: "Apr", candidates: 380, recruiters: 110 },
  { month: "May", candidates: 520, recruiters: 145 },
  { month: "Jun", candidates: 720, recruiters: 195 },
]

const matchingData = [
  { name: "Successful Matches", value: 1245 },
  { name: "Pending Matches", value: 432 },
  { name: "Failed Matches", value: 189 },
]

const colors = ["var(--color-accent)", "var(--color-primary)", "var(--color-secondary)"]

export function AdminAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
  )

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card p-6">
        <div className="space-y-4">
          <h3 className="font-bold text-foreground">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="candidates"
                stroke="var(--color-accent)"
                strokeWidth={2}
                name="Candidates"
              />
              <Line
                type="monotone"
                dataKey="recruiters"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Recruiters"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-border bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Job Applications by Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="candidates" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Matching Results</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={matchingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {matchingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
