import "server-only"
import { readStore, writeStore } from "./store"
import type { ItemsRepository } from "@/lib/repositories/items"
import type { Item } from "@/lib/types"

function assertOwnedItem(items: Record<string, Item>, householdId: string, itemId: string): Item {
  const item = items[itemId]
  if (!item || item.household_id !== householdId) {
    throw new Error(`Item ${itemId} not found in household ${householdId}`)
  }
  return item
}

export const itemsRepository: ItemsRepository = {
  async getItemsBySection(householdId, sectionId) {
    return readStore((store) =>
      Object.values(store.items)
        .filter((item) => item.household_id === householdId && item.section_id === sectionId)
        .sort((a, b) => a.sort_order - b.sort_order)
    )
  },

  async getAllItems(householdId) {
    return readStore((store) =>
      Object.values(store.items).filter((item) => item.household_id === householdId)
    )
  },

  async getItemsDueByWeek(householdId, week) {
    return readStore((store) =>
      Object.values(store.items).filter(
        (item) =>
          item.household_id === householdId &&
          !item.is_checked &&
          item.target_week !== null &&
          item.target_week <= week
      )
    )
  },

  async getItemsForTargetWeek(householdId, week) {
    return readStore((store) =>
      Object.values(store.items).filter(
        (item) => item.household_id === householdId && !item.is_checked && item.target_week === week
      )
    )
  },

  async addItem(householdId, sectionId, id, title, price, subsection = null, targetWeek = null) {
    return writeStore((store) => {
      const siblings = Object.values(store.items).filter(
        (item) => item.household_id === householdId && item.section_id === sectionId
      )
      const nextSortOrder = siblings.reduce((max, item) => Math.max(max, item.sort_order), 0) + 1

      const item: Item = {
        id,
        household_id: householdId,
        section_id: sectionId,
        subsection: subsection ?? null,
        title,
        price: price ?? null,
        target_week: targetWeek ?? null,
        is_checked: false,
        is_seed: false,
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
      }
      store.items[item.id] = item
      return item
    })
  },

  async toggleItem(householdId, itemId) {
    await writeStore((store) => {
      const item = assertOwnedItem(store.items, householdId, itemId)
      item.is_checked = !item.is_checked
    })
  },

  async updateItemPrice(householdId, itemId, price) {
    await writeStore((store) => {
      const item = assertOwnedItem(store.items, householdId, itemId)
      item.price = price
    })
  },

  async updateItemTargetWeek(householdId, itemId, targetWeek) {
    await writeStore((store) => {
      const item = assertOwnedItem(store.items, householdId, itemId)
      item.target_week = targetWeek
    })
  },

  async deleteItem(householdId, itemId) {
    await writeStore((store) => {
      assertOwnedItem(store.items, householdId, itemId)
      delete store.items[itemId]
    })
  },
}
