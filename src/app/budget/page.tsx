import { householdRepository, budgetRepository, itemsRepository } from "@/lib/repositories"
import { calculateBudgetPlan, calculateChecklistMarkedTotal } from "@/lib/budget"
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
  const checklistMarkedTotal = calculateChecklistMarkedTotal(items)
  const spentProgress =
    goal.goal_amount > 0 ? Math.min(100, (goal.spent_amount / goal.goal_amount) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Бюджет</h1>

      <Progress value={spentProgress}>
        <ProgressLabel>{`Витрачено ${goal.spent_amount} з ${goal.goal_amount} грн`}</ProgressLabel>
      </Progress>

      <Card>
        <CardHeader>
          <CardTitle>Заплановано</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{plan} грн — сума цін усіх пунктів чеклистів, незалежно від позначення.</p>
          <p className="text-sm text-muted-foreground">За чеклістом позначено на {checklistMarkedTotal} грн — підказка, не показник витрат.</p>
        </CardContent>
      </Card>

      <BudgetGoalForm initialGoal={goal.goal_amount} initialSpent={goal.spent_amount} />
    </div>
  )
}
