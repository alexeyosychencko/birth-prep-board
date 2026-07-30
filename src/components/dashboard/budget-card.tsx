import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { ProgressValueText } from "@/components/progress-value-text"
import { OtherExpensesQuickEdit } from "@/components/dashboard/other-expenses-quick-edit"
import { calculateChecklistSpent, calculateSpent } from "@/lib/budget"
import type { BudgetGoal, Item } from "@/lib/types"

export function BudgetCard({ goal, items }: { goal: BudgetGoal; items: Item[] }) {
  const checklistSpent = calculateChecklistSpent(items)
  const spent = calculateSpent(items, goal.other_expenses)
  const progress = goal.goal_amount > 0 ? Math.min(100, (spent / goal.goal_amount) * 100) : 0
  const overBy = spent - goal.goal_amount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Бюджет</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Progress value={progress}>
          <ProgressLabel>Витрачено</ProgressLabel>
          <ProgressValueText value={`${spent} з ${goal.goal_amount} грн`} />
        </Progress>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{`за чеклістом ${checklistSpent} грн`}</span>
          <OtherExpensesQuickEdit otherExpenses={goal.other_expenses} />
        </div>
        {goal.goal_amount > 0 && overBy > 0 && (
          <p className="text-xs text-muted-foreground">{`перевищено на ${overBy} грн`}</p>
        )}
      </CardContent>
    </Card>
  )
}
