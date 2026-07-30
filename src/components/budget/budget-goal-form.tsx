"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateBudgetGoalAction, updateOtherExpensesAction } from "@/lib/actions/budget-actions"

export function BudgetGoalForm({
  initialGoal,
  initialOtherExpenses,
}: {
  initialGoal: number
  initialOtherExpenses: number
}) {
  const [goalInput, setGoalInput] = useState(String(initialGoal))
  const [otherExpensesInput, setOtherExpensesInput] = useState(String(initialOtherExpenses))
  const [goalError, setGoalError] = useState<string | null>(null)
  const [otherExpensesError, setOtherExpensesError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedGoal = Number(goalInput)
    const goalInvalid = !Number.isFinite(parsedGoal) || parsedGoal <= 0
    setGoalError(goalInvalid ? "Ціль має бути більшою за 0" : null)

    const trimmedOtherExpenses = otherExpensesInput.trim()
    const parsedOtherExpenses = trimmedOtherExpenses === "" ? 0 : Number(trimmedOtherExpenses)
    const otherExpensesInvalid = !Number.isFinite(parsedOtherExpenses) || parsedOtherExpenses < 0
    setOtherExpensesError(otherExpensesInvalid ? "Не може бути від'ємним" : null)

    if (goalInvalid || otherExpensesInvalid) return

    startTransition(async () => {
      try {
        await Promise.all([
          updateBudgetGoalAction(parsedGoal),
          updateOtherExpensesAction(parsedOtherExpenses),
        ])
      } catch {
        setGoalInput(String(initialGoal))
        setOtherExpensesInput(String(initialOtherExpenses))
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
          step="0.01"
          inputMode="decimal"
          value={goalInput}
          onChange={(event) => setGoalInput(event.target.value)}
          disabled={isPending}
        />
        {goalError && <span className="text-xs text-destructive">{goalError}</span>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="other-expenses">Інші витрати, грн</Label>
        <Input
          id="other-expenses"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={otherExpensesInput}
          onChange={(event) => setOtherExpensesInput(event.target.value)}
          disabled={isPending}
        />
        {otherExpensesError && <span className="text-xs text-destructive">{otherExpensesError}</span>}
      </div>
      <Button type="submit" disabled={isPending}>Зберегти</Button>
    </form>
  )
}
