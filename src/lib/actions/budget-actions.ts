"use server"

import { revalidatePath } from "next/cache"
import { budgetRepository, householdRepository } from "@/lib/repositories"

export async function updateBudgetGoalAction(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid budget goal amount")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await budgetRepository.updateGoal(household.id, amount)
  revalidatePath("/budget")
  revalidatePath("/")
}

export async function updateOtherExpensesAction(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid other expenses amount")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await budgetRepository.updateOtherExpenses(household.id, amount)
  revalidatePath("/budget")
  revalidatePath("/")
}
