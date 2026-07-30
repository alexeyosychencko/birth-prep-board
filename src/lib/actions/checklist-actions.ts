"use server"

import { revalidatePath } from "next/cache"
import { itemsRepository, householdRepository } from "@/lib/repositories"
import { SECTIONS_LIST } from "@/lib/sections"
import type { Subsection } from "@/lib/types"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function toggleItemAction(path: string, itemId: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.toggleItem(household.id, itemId)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}

export async function addItemAction(
  path: string,
  sectionId: string,
  id: string,
  title: string,
  price: number | null,
  subsection: Subsection | null = null,
  targetWeek: number | null = null
): Promise<void> {
  if (!UUID_RE.test(id)) throw new Error("Invalid item id")
  const trimmedTitle = title.trim()
  if (!trimmedTitle) throw new Error("Title is required")
  if (price !== null && !(Number.isFinite(price) && price >= 0)) throw new Error("Invalid price")
  if (!SECTIONS_LIST.some((section) => section.id === sectionId)) throw new Error("Invalid section id")
  if (targetWeek !== null && !(Number.isInteger(targetWeek) && targetWeek >= 1 && targetWeek <= 42)) {
    throw new Error("Invalid target week")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.addItem(household.id, sectionId, id, trimmedTitle, price, subsection, targetWeek)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}

export async function deleteItemAction(path: string, itemId: string): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.deleteItem(household.id, itemId)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}

export async function updateItemPriceAction(path: string, itemId: string, price: number | null): Promise<void> {
  if (price !== null && !(Number.isFinite(price) && price >= 0)) throw new Error("Invalid price")

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.updateItemPrice(household.id, itemId, price)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}
