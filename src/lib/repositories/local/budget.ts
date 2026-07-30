import "server-only"
import { readStore, writeStore } from "./store"
import type { BudgetRepository } from "@/lib/repositories/budget"

export const budgetRepository: BudgetRepository = {
  async getBudgetGoal(householdId) {
    return readStore((store) => {
      const goal = Object.values(store.budgetGoals).find((g) => g.household_id === householdId)
      if (!goal) throw new Error(`Budget goal not found for household ${householdId}`)
      return goal
    })
  },

  async updateGoal(householdId, amount) {
    await writeStore((store) => {
      const goal = Object.values(store.budgetGoals).find((g) => g.household_id === householdId)
      if (!goal) throw new Error(`Budget goal not found for household ${householdId}`)
      goal.goal_amount = amount
    })
  },

  async updateSpent(householdId, amount) {
    await writeStore((store) => {
      const goal = Object.values(store.budgetGoals).find((g) => g.household_id === householdId)
      if (!goal) throw new Error(`Budget goal not found for household ${householdId}`)
      goal.spent_amount = amount
    })
  },
}
