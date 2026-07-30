import type { Item } from "./types"

export function calculateBudgetPlan(items: Item[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0), 0)
}

/** Sum of prices for checked items — a checklist-progress hint, not a source of truth for spending. */
export function calculateChecklistMarkedTotal(items: Item[]): number {
  return items
    .filter((item) => item.is_checked)
    .reduce((sum, item) => sum + (item.price ?? 0), 0)
}
