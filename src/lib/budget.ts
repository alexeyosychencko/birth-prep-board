import type { Item } from "./types"

export function calculateBudgetPlan(items: Item[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0), 0)
}

export function calculateBudgetFact(items: Item[]): number {
  return items
    .filter((item) => item.is_checked)
    .reduce((sum, item) => sum + (item.price ?? 0), 0)
}
