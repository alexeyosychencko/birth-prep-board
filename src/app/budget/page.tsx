import { householdRepository, budgetRepository, itemsRepository } from "@/lib/repositories"
import { calculateBudgetPlan, calculateBudgetFact } from "@/lib/budget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { BudgetGoalForm } from "@/components/budget/budget-goal-form"

export default async function Page() {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  const [goal, items] = await Promise.all([
    budgetRepository.getBudgetGoal(household.id),
    itemsRepository.getAllItems(household.id),
  ])
  const plan = calculateBudgetPlan(items)
  const fact = calculateBudgetFact(items)
  const factProgress = goal.goal_amount > 0 ? Math.min(100, (fact / goal.goal_amount) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading font-semibold">Бюджет</h1>

      <Progress value={factProgress}>
        <ProgressLabel>{`Витрачено ${fact} з ${goal.goal_amount} грн`}</ProgressLabel>
        <ProgressValue />
      </Progress>

      <Card>
        <CardHeader>
          <CardTitle>Заплановано</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{plan} грн — сума цін усіх пунктів чеклистів, незалежно від позначення.</p>
        </CardContent>
      </Card>

      <BudgetGoalForm initialGoal={goal.goal_amount} />
    </div>
  )
}
