import { householdRepository, budgetRepository, itemsRepository } from "@/lib/repositories"
import { calculateBudgetPlan, calculateChecklistSpent, calculateSpent } from "@/lib/budget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { BudgetGoalForm } from "@/components/budget/budget-goal-form"

export const dynamic = "force-dynamic"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [goal, items] = await Promise.all([
    budgetRepository.getBudgetGoal(household.id),
    itemsRepository.getAllItems(household.id),
  ])
  const plan = calculateBudgetPlan(items)
  const checklistSpent = calculateChecklistSpent(items)
  const spent = calculateSpent(items, goal.other_expenses)
  const spentProgress = goal.goal_amount > 0 ? Math.min(100, (spent / goal.goal_amount) * 100) : 0
  const overBy = spent - goal.goal_amount

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Бюджет</h1>

      <div className="flex flex-col gap-1">
        <Progress value={spentProgress}>
          <ProgressLabel>{`Витрачено ${spent} з ${goal.goal_amount} грн`}</ProgressLabel>
        </Progress>
        <p className="text-sm text-muted-foreground">
          {`за чеклістом ${checklistSpent} грн + інші витрати ${goal.other_expenses} грн = витрачено ${spent} грн`}
        </p>
        {goal.goal_amount > 0 && overBy > 0 && (
          <p className="text-sm text-muted-foreground">{`перевищено на ${overBy} грн`}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заплановано</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{plan} грн — сума цін усіх пунктів чеклистів, незалежно від позначення.</p>
        </CardContent>
      </Card>

      <BudgetGoalForm initialGoal={goal.goal_amount} initialOtherExpenses={goal.other_expenses} />
    </div>
  )
}
