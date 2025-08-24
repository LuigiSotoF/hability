"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DateFilter = "all" | "last15days" | "thismonth" | "last3months" | "last6months"

export interface DateFilterSelectorProps {
  onFilterChange?: (filter: DateFilter, startDate: Date | null, endDate: Date | null) => void
  defaultValue?: DateFilter
}

// Configuración de filtros usando un array
const FILTER_OPTIONS = [
  {
    value: "all" as DateFilter,
    label: "Todos",
    calculateDate: () => {
      return { startDate: null, endDate: null }
    }
  },
  {
    value: "last15days" as DateFilter,
    label: "Últimos 15 días",
    calculateDate: (now: Date) => {
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 15)
      return { startDate, endDate: new Date(now) }
    }
  },
  {
    value: "thismonth" as DateFilter,
    label: "Este mes",
    calculateDate: (now: Date) => {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate, endDate: new Date(now) }
    }
  },
  {
    value: "last3months" as DateFilter,
    label: "Últimos 3 meses",
    calculateDate: (now: Date) => {
      const startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 3)
      return { startDate, endDate: new Date(now) }
    }
  },
  {
    value: "last6months" as DateFilter,
    label: "Últimos 6 meses",
    calculateDate: (now: Date) => {
      const startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 6)
      return { startDate, endDate: new Date(now) }
    }
  }
]

export function DateFilterSelector({ onFilterChange, defaultValue }: DateFilterSelectorProps) {
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>(defaultValue || "thismonth")

  const calculateDateRange = (filter: DateFilter): { startDate: Date | null; endDate: Date | null } => {
    const now = new Date()
    const filterOption = FILTER_OPTIONS.find(option => option.value === filter)

    if (filterOption) {
      return filterOption.calculateDate(now)
    }

    // Fallback al filtro por defecto
    const defaultOption = FILTER_OPTIONS.find(option => option.value === "thismonth")!
    return defaultOption.calculateDate(now)
  }

  const handleFilterChange = (value: string) => {
    const filter = value as DateFilter
    setSelectedFilter(filter)

    const { startDate, endDate } = calculateDateRange(filter)

    if (onFilterChange) {
      onFilterChange(filter, startDate, endDate)
    }
  }

  useEffect(() => {
    const { startDate, endDate } = calculateDateRange(selectedFilter)
    if (onFilterChange) {
      onFilterChange(selectedFilter, startDate, endDate)
    }
  }, [])

  return (
    <Select value={selectedFilter} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Este mes" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
