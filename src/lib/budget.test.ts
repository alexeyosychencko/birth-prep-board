import { describe, expect, it } from "vitest"
import { calculateBudgetPlan, calculateChecklistSpent, calculateSpent } from "./budget"
import type { Item } from "./types"

function item(overrides: Partial<Item>): Item {
  return {
    id: crypto.randomUUID(),
    household_id: "h1",
    section_id: "s1",
    subsection: null,
    title: "x",
    price: null,
    target_week: null,
    is_checked: false,
    is_seed: false,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("calculateBudgetPlan", () => {
  it("sums price across all items regardless of is_checked", () => {
    const items = [item({ price: 100 }), item({ price: 50, is_checked: true }), item({ price: null })]
    expect(calculateBudgetPlan(items)).toBe(150)
  })

  it("returns 0 for an empty list", () => {
    expect(calculateBudgetPlan([])).toBe(0)
  })
})

describe("calculateChecklistSpent", () => {
  it("sums price only for checked items", () => {
    const items = [item({ price: 100, is_checked: true }), item({ price: 50, is_checked: false }), item({ price: 20, is_checked: true })]
    expect(calculateChecklistSpent(items)).toBe(120)
  })

  it("treats a checked item with null price as contributing 0", () => {
    const items = [item({ price: null, is_checked: true })]
    expect(calculateChecklistSpent(items)).toBe(0)
  })
})

describe("calculateSpent", () => {
  it("adds other expenses to checklist spending", () => {
    const items = [item({ price: 100, is_checked: true })]
    expect(calculateSpent(items, 50)).toBe(150)
  })

  it("treats a checked item with null price as contributing 0", () => {
    const items = [item({ price: null, is_checked: true })]
    expect(calculateSpent(items, 30)).toBe(30)
  })

  it("excludes unchecked items even when they have a price", () => {
    const items = [item({ price: 200, is_checked: false })]
    expect(calculateSpent(items, 10)).toBe(10)
  })

  it("returns 0 when there is no checklist spending and otherExpenses is 0", () => {
    const items = [item({ price: null, is_checked: false })]
    expect(calculateSpent(items, 0)).toBe(0)
  })
})
