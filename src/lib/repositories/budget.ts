import type { BudgetGoal } from "@/lib/types"

export interface BudgetRepository {
  getBudgetGoal(householdId: string): Promise<BudgetGoal>
  updateGoal(householdId: string, amount: number): Promise<void>
  updateOtherExpenses(householdId: string, amount: number): Promise<void>
}
