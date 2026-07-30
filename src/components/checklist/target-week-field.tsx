"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Item } from "@/lib/types"
import { formatWeekBadgeLabel } from "@/lib/pregnancy"

export function TargetWeekField({
  item,
  isPending,
  onUpdate,
  editing,
  onEditingChange,
  currentWeek = null,
}: {
  item: Item
  isPending: boolean
  onUpdate: (targetWeek: number | null) => void
  editing: boolean
  onEditingChange: (editing: boolean) => void
  currentWeek?: number | null
}) {
  const [error, setError] = useState<string | null>(null)

  if (editing) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <Input
          type="number"
          min="1"
          max="42"
          step="1"
          inputMode="numeric"
          aria-label="Тиждень, до якого зробити"
          defaultValue={item.target_week ?? ""}
          disabled={isPending}
          autoFocus
          className="h-8 w-20 text-right text-sm"
          onBlur={(event) => {
            const raw = event.currentTarget.value.trim()
            if (raw === "") {
              setError(null)
              onEditingChange(false)
              onUpdate(null)
              return
            }
            const parsed = Number(raw)
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > 42) {
              setError("Тиждень від 1 до 42")
              return
            }
            setError(null)
            onEditingChange(false)
            if (parsed !== item.target_week) onUpdate(parsed)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    )
  }

  if (item.target_week !== null) {
    return (
      <button type="button" onClick={() => onEditingChange(true)} disabled={isPending} className="shrink-0">
        <Badge variant="secondary">{formatWeekBadgeLabel(item.target_week, currentWeek)}</Badge>
      </button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => onEditingChange(true)}
      className="h-7 shrink-0 px-2 text-xs text-muted-foreground"
    >
      + тиждень
    </Button>
  )
}
