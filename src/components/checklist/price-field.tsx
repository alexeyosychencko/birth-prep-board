"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Item } from "@/lib/types"

export function PriceField({
  item,
  isPending,
  onUpdate,
}: {
  item: Item
  isPending: boolean
  onUpdate: (price: number | null) => void
}) {
  const [editing, setEditing] = useState(false)

  if (item.price !== null || editing) {
    return (
      <Input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        aria-label="Ціна, грн"
        defaultValue={item.price ?? ""}
        disabled={isPending}
        autoFocus={editing && item.price === null}
        className="h-8 w-20 text-right text-sm text-muted-foreground"
        onBlur={(event) => {
          const raw = event.currentTarget.value.trim()
          if (raw === "") {
            setEditing(false)
            if (item.price !== null) onUpdate(null)
            return
          }
          const parsed = Number(raw)
          if (Number.isNaN(parsed) || parsed < 0) {
            event.currentTarget.value = item.price === null ? "" : String(item.price)
            return
          }
          setEditing(false)
          if (parsed === item.price) return
          onUpdate(parsed)
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
      className="h-7 shrink-0 px-2 text-xs text-muted-foreground"
    >
      вказати ціну
    </Button>
  )
}
