"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Note01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Item } from "@/lib/types"

export function NoteIndicator({
  hasNote,
  expanded,
  onToggle,
}: {
  hasNote: boolean
  expanded: boolean
  onToggle: () => void
}) {
  if (!hasNote) return null
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={expanded ? "Згорнути нотатку" : "Розгорнути нотатку"}
      aria-expanded={expanded}
      onClick={onToggle}
      className="shrink-0 text-muted-foreground"
    >
      <HugeiconsIcon icon={Note01Icon} strokeWidth={2} />
    </Button>
  )
}

export function NoteView({ note }: { note: string }) {
  return <p className="pl-7 text-sm text-muted-foreground whitespace-pre-wrap">{note}</p>
}

export function NoteEditor({
  item,
  isPending,
  onUpdate,
  onDone,
}: {
  item: Item
  isPending: boolean
  onUpdate: (note: string | null) => void
  onDone: () => void
}) {
  const [value, setValue] = useState(item.note ?? "")

  return (
    <Textarea
      autoFocus
      disabled={isPending}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      placeholder="Нотатка…"
      className="ml-7 text-sm"
      onBlur={() => {
        const trimmed = value.trim()
        const next = trimmed === "" ? null : trimmed
        onDone()
        if (next !== item.note) onUpdate(next)
      }}
    />
  )
}
