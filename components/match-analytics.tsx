"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const matchDistribution = [
  { range: "90-100%", count: 3 },
  { range: "80-89%", count: 8 },
  { range: "70-79%", count: 15 },
  { range: "60-69%", count: 12 },
  { range: "<60%", count: 5 },
]

const matchTrend = [
  { week: "Week 1", matches: 12, applications: 3 },
  { week: "Week 2", matches: 15, applications: 5 },
  { week: "Week 3", matches: 18, applications: 7 },
  { week: "Week 4", matches: 24, applications: 9 },
]

export function MatchAnalytics() {
  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card p-6">
        <div className="space-y-4">
          <h3 className="font-bold text-foreground">Match Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matchDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="range" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border border-border bg-card p-6">
        <div className="space-y-4">
          <h3 className="font-bold text-foreground">Matches & Applications Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={matchTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
              <Line type="monotone" dataKey="matches" stroke="var(--color-accent)" strokeWidth={2} />
              <Line type="monotone" dataKey="applications" stroke="var(--color-primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
