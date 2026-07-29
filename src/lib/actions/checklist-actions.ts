"use server"

import { revalidatePath } from "next/cache"
import { itemsRepository, householdRepository } from "@/lib/repositories"
import type { Subsection } from "@/lib/types"

export async function toggleItemAction(path: string, itemId: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.toggleItem(household.id, itemId)
  revalidatePath(path)
}

export async function addItemAction(
  path: string,
  sectionId: string,
  id: string,
  title: string,
  price: number | null,
  subsection: Subsection | null = null
): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.addItem(household.id, sectionId, id, title, price, subsection)
  revalidatePath(path)
}

export async function deleteItemAction(path: string, itemId: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.deleteItem(household.id, itemId)
  revalidatePath(path)
}
