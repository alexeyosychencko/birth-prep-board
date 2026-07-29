"use server"

import { revalidatePath } from "next/cache"
import { pregnancyRepository, householdRepository } from "@/lib/repositories"

export async function updateDueDateAction(dueDate: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await pregnancyRepository.updateDueDate(household.id, dueDate)
  revalidatePath("/settings")
  revalidatePath("/")
}
