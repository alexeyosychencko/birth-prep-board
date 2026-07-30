"use server"

import { revalidatePath } from "next/cache"
import { budgetRepository, householdRepository } from "@/lib/repositories"

export async function updateBudgetGoalAction(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid budget goal amount")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await budgetRepository.updateGoal(household.id, amount)
  revalidatePath("/budget")
}

export async function updateBudgetSpentAction(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid budget spent amount")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await budgetRepository.updateSpent(household.id, amount)
  revalidatePath("/budget")
}
