"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, X } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface DateFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClearDates: () => void
  className?: string
}

export function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDates,
  className = ""
}: DateFilterProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = startDate || endDate

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          {t("common.dateFilter") || "Date Filter"}
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {[startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearDates}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label htmlFor="start-date" className="text-sm font-medium">
              {t("common.startDate") || "Start Date"}
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-date" className="text-sm font-medium">
              {t("common.endDate") || "End Date"}
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-9"
              min={startDate || undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}
