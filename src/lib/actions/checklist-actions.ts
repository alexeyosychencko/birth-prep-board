"use server"

import { revalidatePath } from "next/cache"
import { itemsRepository, householdRepository } from "@/lib/repositories"
import { SECTIONS_LIST } from "@/lib/sections"
import type { ItemStatus, Subsection } from "@/lib/types"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ITEM_STATUSES: ItemStatus[] = ["todo", "in_progress", "done"]

export async function setItemStatusAction(path: string, itemId: string, status: ItemStatus): Promise<void> {
  if (!ITEM_STATUSES.includes(status)) throw new Error("Invalid status")

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.setItemStatus(household.id, itemId, status)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}

export async function updateItemNoteAction(path: string, itemId: string, note: string | null): Promise<void> {
  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.updateItemNote(household.id, itemId, note)
  revalidatePath(path)
  revalidatePath("/")
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

export async function updateItemTargetWeekAction(
  path: string,
  itemId: string,
  targetWeek: number | null
): Promise<void> {
  if (targetWeek !== null && !(Number.isInteger(targetWeek) && targetWeek >= 1 && targetWeek <= 42)) {
    throw new Error("Invalid target week")
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.updateItemTargetWeek(household.id, itemId, targetWeek)
  revalidatePath(path)
  revalidatePath("/")
  revalidatePath("/budget")
}

export async function reorderItemsAction(path: string, sectionId: string, orderedIds: string[]): Promise<void> {
  if (!SECTIONS_LIST.some((section) => section.id === sectionId)) throw new Error("Invalid section id")
  if (!orderedIds.every((id) => UUID_RE.test(id))) throw new Error("Invalid item id")

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.reorderItems(household.id, sectionId, orderedIds)
  revalidatePath(path)
}

export async function bulkUpdateTargetWeeksAction(
  path: string,
  updates: { itemId: string; targetWeek: number | null }[]
): Promise<void> {
  for (const { itemId, targetWeek } of updates) {
    if (!UUID_RE.test(itemId)) throw new Error("Invalid item id")
    if (targetWeek !== null && !(Number.isInteger(targetWeek) && targetWeek >= 1 && targetWeek <= 42)) {
      throw new Error("Invalid target week")
    }
  }

  const household = await householdRepository.getOrCreateDefaultHousehold()
  await itemsRepository.bulkUpdateTargetWeeks(household.id, updates)
  revalidatePath(path)
  revalidatePath("/")
  for (const section of SECTIONS_LIST) revalidatePath(`/${section.key}`)
}
