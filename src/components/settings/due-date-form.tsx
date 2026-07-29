"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateDueDateAction } from "@/lib/actions/pregnancy-actions"

export function DueDateForm({ initialDueDate }: { initialDueDate: string }) {
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dueDate) return
    const previous = dueDate
    startTransition(async () => {
      try {
        await updateDueDateAction(dueDate)
      } catch {
        setDueDate(previous)
        toast.error("Не вдалось оновити ПДР. Спробуйте ще раз.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="due-date" className="text-sm text-muted-foreground">Очікувана дата пологів</label>
        <Input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>Зберегти</Button>
    </form>
  )
}
