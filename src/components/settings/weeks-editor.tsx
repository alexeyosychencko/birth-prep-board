"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { bulkUpdateTargetWeeksAction } from "@/lib/actions/checklist-actions"
import type { Item, Section } from "@/lib/types"

function draftValue(targetWeek: number | null): string {
  return targetWeek === null ? "" : String(targetWeek)
}

function parseDraft(raw: string): { targetWeek: number | null } | { error: string } {
  const trimmed = raw.trim()
  if (trimmed === "") return { targetWeek: null }
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 42) {
    return { error: "Тиждень від 1 до 42" }
  }
  return { targetWeek: parsed }
}

export function WeeksEditor({ items, sections }: { items: Item[]; sections: Section[] }) {
  const path = usePathname()
  const [isPending, startTransition] = useTransition()
  const [onlyWithoutWeek, setOnlyWithoutWeek] = useState(true)
  const [baseline, setBaseline] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.target_week]))
  )
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, draftValue(item.target_week)]))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dirtyIds = useMemo(
    () => items.map((item) => item.id).filter((id) => drafts[id] !== draftValue(baseline[id] ?? null)),
    [items, drafts, baseline]
  )
  const hasUnsavedChanges = dirtyIds.length > 0

  useEffect(() => {
    if (!hasUnsavedChanges) return
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  function handleChange(itemId: string, raw: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: raw }))
    setErrors((prev) => {
      if (!(itemId in prev)) return prev
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  function handleSave() {
    const updates: { itemId: string; targetWeek: number | null }[] = []
    const nextErrors: Record<string, string> = {}

    for (const itemId of dirtyIds) {
      const result = parseDraft(drafts[itemId])
      if ("error" in result) {
        nextErrors[itemId] = result.error
      } else {
        updates.push({ itemId, targetWeek: result.targetWeek })
      }
    }

    setErrors(nextErrors)
    if (updates.length === 0) return

    startTransition(async () => {
      try {
        await bulkUpdateTargetWeeksAction(path, updates)
        setBaseline((prev) => {
          const next = { ...prev }
          for (const update of updates) next[update.itemId] = update.targetWeek
          return next
        })
        toast.success("Тижні збережено")
      } catch {
        toast.error("Не вдалось зберегти тижні. Спробуйте ще раз.")
      }
    })
  }

  const itemsBySection = useMemo(() => {
    const map = new Map<string, Item[]>()
    for (const item of items) {
      const list = map.get(item.section_id) ?? []
      list.push(item)
      map.set(item.section_id, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order)
    return map
  }, [items])

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Поки немає пунктів для редагування тижнів.</p>
  }

  const sectionGroups = sections
    .map((section) => ({
      section,
      items: (itemsBySection.get(section.id) ?? []).filter(
        (item) => !onlyWithoutWeek || baseline[item.id] === null
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Switch id="only-without-week" checked={onlyWithoutWeek} onCheckedChange={setOnlyWithoutWeek} />
        <Label htmlFor="only-without-week">Тільки без тижня</Label>
      </div>

      {sectionGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Усі пункти вже мають тиждень.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {sectionGroups.map(({ section, items: sectionItems }) => (
            <div key={section.id} className="flex flex-col gap-2">
              <h2 className="text-base font-heading font-medium">{section.title_uk}</h2>
              <ul className="flex flex-col gap-1">
                {sectionItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-1.5">
                    <span className="flex-1 truncate text-sm">{item.title}</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <Input
                        type="number"
                        min="1"
                        max="42"
                        step="1"
                        inputMode="numeric"
                        aria-label={`Тиждень для «${item.title}»`}
                        aria-invalid={item.id in errors || undefined}
                        value={drafts[item.id] ?? ""}
                        disabled={isPending}
                        onChange={(event) => handleChange(item.id, event.currentTarget.value)}
                        className="h-8 w-20 text-right text-sm"
                      />
                      {errors[item.id] && <span className="text-xs text-destructive">{errors[item.id]}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background p-4">
        {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Є незбережені зміни</span>}
        <Button type="button" onClick={handleSave} disabled={isPending || !hasUnsavedChanges}>
          Зберегти
        </Button>
      </div>
    </div>
  )
}
