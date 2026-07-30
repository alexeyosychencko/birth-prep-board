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
    status: "todo",
    note: null,
    is_seed: false,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("calculateBudgetPlan", () => {
  it("sums price across all items regardless of status", () => {
    const items = [item({ price: 100 }), item({ price: 50, status: "done" }), item({ price: null })]
    expect(calculateBudgetPlan(items)).toBe(150)
  })

  it("includes in_progress items in the plan", () => {
    const items = [item({ price: 100, status: "in_progress" })]
    expect(calculateBudgetPlan(items)).toBe(100)
  })

  it("returns 0 for an empty list", () => {
    expect(calculateBudgetPlan([])).toBe(0)
  })
})

describe("calculateChecklistSpent", () => {
  it("sums price only for done items", () => {
    const items = [item({ price: 100, status: "done" }), item({ price: 50, status: "todo" }), item({ price: 20, status: "done" })]
    expect(calculateChecklistSpent(items)).toBe(120)
  })

  it("treats a done item with null price as contributing 0", () => {
    const items = [item({ price: null, status: "done" })]
    expect(calculateChecklistSpent(items)).toBe(0)
  })

  it("excludes in_progress items even when they have a price", () => {
    const items = [item({ price: 300, status: "in_progress" })]
    expect(calculateChecklistSpent(items)).toBe(0)
  })
})

describe("calculateSpent", () => {
  it("adds other expenses to checklist spending", () => {
    const items = [item({ price: 100, status: "done" })]
    expect(calculateSpent(items, 50)).toBe(150)
  })

  it("treats a done item with null price as contributing 0", () => {
    const items = [item({ price: null, status: "done" })]
    expect(calculateSpent(items, 30)).toBe(30)
  })

  it("excludes todo items even when they have a price", () => {
    const items = [item({ price: 200, status: "todo" })]
    expect(calculateSpent(items, 10)).toBe(10)
  })

  it("excludes in_progress items from spending but they still count toward plan", () => {
    const items = [item({ price: 150, status: "in_progress" })]
    expect(calculateSpent(items, 0)).toBe(0)
    expect(calculateBudgetPlan(items)).toBe(150)
  })

  it("returns 0 when there is no checklist spending and otherExpenses is 0", () => {
    const items = [item({ price: null, status: "todo" })]
    expect(calculateSpent(items, 0)).toBe(0)
  })
})
