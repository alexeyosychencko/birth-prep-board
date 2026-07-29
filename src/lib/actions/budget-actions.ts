"use server"

import { revalidatePath } from "next/cache"
import { budgetRepository, householdRepository } from "@/lib/repositories"

export async function updateBudgetGoalAction(amount: number): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await budgetRepository.updateGoal(household.id, amount)
  revalidatePath("/budget")
}
