"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateBudgetGoalAction, updateBudgetSpentAction } from "@/lib/actions/budget-actions"

export function BudgetGoalForm({
  initialGoal,
  initialSpent,
}: {
  initialGoal: number
  initialSpent: number
}) {
  const [goalInput, setGoalInput] = useState(String(initialGoal))
  const [spentInput, setSpentInput] = useState(String(initialSpent))
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedGoal = Number(goalInput)
    const parsedSpent = Number(spentInput)
    if (!Number.isFinite(parsedGoal) || parsedGoal < 0) return
    if (!Number.isFinite(parsedSpent) || parsedSpent < 0) return

    startTransition(async () => {
      try {
        await Promise.all([
          updateBudgetGoalAction(parsedGoal),
          updateBudgetSpentAction(parsedSpent),
        ])
      } catch {
        setGoalInput(String(initialGoal))
        setSpentInput(String(initialSpent))
        toast.error("Не вдалось оновити бюджет. Спробуйте ще раз.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="goal">Ціль, грн</Label>
        <Input
          id="goal"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={goalInput}
          onChange={(event) => setGoalInput(event.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="spent">Витрачено, грн</Label>
        <Input
          id="spent"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={spentInput}
          onChange={(event) => setSpentInput(event.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending}>Зберегти</Button>
    </form>
  )
}
