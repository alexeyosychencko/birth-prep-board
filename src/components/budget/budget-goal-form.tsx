"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateBudgetGoalAction } from "@/lib/actions/budget-actions"

export function BudgetGoalForm({ initialGoal }: { initialGoal: number }) {
  const [goal, setGoal] = useState(initialGoal)
  const [inputValue, setInputValue] = useState(String(initialGoal))
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = Number(inputValue)
    if (!Number.isFinite(parsed) || parsed < 0) return
    const previousGoal = goal
    setGoal(parsed)
    startTransition(async () => {
      try {
        await updateBudgetGoalAction(parsed)
      } catch {
        setGoal(previousGoal)
        setInputValue(String(previousGoal))
        toast.error("Не вдалось оновити ціль. Спробуйте ще раз.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="goal" className="text-sm text-muted-foreground">Ціль, грн</label>
        <Input
          id="goal"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending}>Зберегти</Button>
    </form>
  )
}
