import { describe, expect, it } from "vitest"
import { getCurrentWeek } from "./pregnancy"

describe("getCurrentWeek", () => {
  it("clamps to 20 when the due date is far in the future", () => {
    const today = new Date("2026-01-01")
    const dueDate = new Date("2026-12-01")
    expect(getCurrentWeek(dueDate, today)).toBe(20)
  })

  it("clamps to 40 when the due date has already passed", () => {
    const today = new Date("2026-06-01")
    const dueDate = new Date("2026-01-01")
    expect(getCurrentWeek(dueDate, today)).toBe(40)
  })

  it("computes the unclamped week within range", () => {
    const dueDate = new Date("2026-09-21")
    const today = new Date("2026-07-27")
    // 8 weeks before the due date => 40 - 8 = 32
    expect(getCurrentWeek(dueDate, today)).toBe(32)
  })
})
