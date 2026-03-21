"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface FilterState {
  search: string
  minMatch: number
  locations: string[]
  salaryMin: string
  salaryMax: string
}

interface JobFilterProps {
  onFilter: (filters: FilterState) => void
}

const locations = ["Remote", "San Francisco", "New York", "Los Angeles", "Chicago", "Austin"]
const defaultLocations = ["Remote", "San Francisco"]

export function JobFilter({ onFilter }: JobFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    minMatch: 70,
    locations: defaultLocations,
    salaryMin: "80",
    salaryMax: "200",
  })

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilter(updated)
  }

  const toggleLocation = (location: string) => {
    const updated = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location]
    handleFilterChange({ locations: updated })
  }

  return (
    <Card className="border border-border bg-card p-6 space-y-6">
      <div>
        <h3 className="font-bold text-foreground mb-4">Filters</h3>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Search Jobs</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Job title, company..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground pl-10"
          />
        </div>
      </div>

      {/* Match Score */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center justify-between">
          Minimum Match Score
          <span className="text-accent">{filters.minMatch}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minMatch}
          onChange={(e) => handleFilterChange({ minMatch: Number.parseInt(e.target.value) })}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Locations</label>
        <div className="space-y-2">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => toggleLocation(loc)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                filters.locations.includes(loc)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Salary Range (K USD)</label>
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={filters.salaryMin}
            onChange={(e) => handleFilterChange({ salaryMin: e.target.value })}
            className="bg-background border-border text-foreground text-sm"
          />
          <span className="text-muted-foreground flex items-center">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.salaryMax}
            onChange={(e) => handleFilterChange({ salaryMax: e.target.value })}
            className="bg-background border-border text-foreground text-sm"
          />
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full border-border text-foreground hover:bg-muted gap-2 bg-transparent"
        onClick={() => {
          const reset = {
            search: "",
            minMatch: 70,
            locations: defaultLocations,
            salaryMin: "80",
            salaryMax: "200",
          }
          setFilters(reset)
          onFilter(reset)
        }}
      >
        <X className="w-4 h-4" />
        Clear Filters
      </Button>
    </Card>
  )
}
