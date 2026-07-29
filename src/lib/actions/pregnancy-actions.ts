"use server"

import { revalidatePath } from "next/cache"
import { pregnancyRepository, householdRepository } from "@/lib/repositories"

export async function updateDueDateAction(dueDate: string): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(Date.parse(dueDate))) {
    throw new Error("Invalid due date")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await pregnancyRepository.updateDueDate(household.id, dueDate)
  revalidatePath("/settings")
  revalidatePath("/")
}
