import type { Item } from "./types"

export function calculateBudgetPlan(items: Item[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0), 0)
}

/** Sum of prices for done items — the checklist portion of actual spending. */
export function calculateChecklistSpent(items: Item[]): number {
  return items
    .filter((item) => item.status === "done")
    .reduce((sum, item) => sum + (item.price ?? 0), 0)
}

/** Total spent = checklist spending + manually entered expenses outside the checklist. */
export function calculateSpent(items: Item[], otherExpenses: number): number {
  return calculateChecklistSpent(items) + otherExpenses
}
