"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateOtherExpensesAction } from "@/lib/actions/budget-actions"

export function OtherExpensesQuickEdit({ otherExpenses }: { otherExpenses: number }) {
  const [editing, setEditing] = useState(false)
  const [optimisticValue, setOptimisticValue] = useState(otherExpenses)
  const [isPending, startTransition] = useTransition()

  function handleSave(next: number) {
    startTransition(async () => {
      setOptimisticValue(next)
      try {
        await updateOtherExpensesAction(next)
      } catch {
        setOptimisticValue(otherExpenses)
        toast.error("Не вдалось оновити інші витрати. Спробуйте ще раз.")
      }
    })
  }

  if (editing) {
    return (
      <Input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        aria-label="Інші витрати, грн"
        defaultValue={optimisticValue}
        disabled={isPending}
        autoFocus
        className="h-7 w-20 text-right font-mono text-xs"
        onBlur={(event) => {
          const raw = event.currentTarget.value.trim()
          const parsed = raw === "" ? 0 : Number(raw)
          setEditing(false)
          if (!Number.isFinite(parsed) || parsed < 0) return
          if (parsed === optimisticValue) return
          handleSave(parsed)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
        }}
      />
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => setEditing(true)}
      className="h-7 px-2 font-mono text-xs text-muted-foreground tabular-nums"
    >
      {`інші ${optimisticValue} грн`}
    </Button>
  )
}
