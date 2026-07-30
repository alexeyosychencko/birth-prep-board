import { describe, expect, it } from "vitest"
import { getCurrentWeek } from "./pregnancy"

describe("getCurrentWeek", () => {
  it("returns the real week below 20 when the due date is far in the future", () => {
    const today = new Date("2026-01-01")
    const dueDate = new Date("2026-12-01")
    // due date is ~48 weeks out => 40 - 48 = -8, clamped only at 0
    expect(getCurrentWeek(dueDate, today)).toBe(0)
  })

  it("returns a week just under 20 without clamping to 20", () => {
    const dueDate = new Date("2026-09-21")
    const today = new Date("2026-04-27")
    // 21 weeks before the due date => 40 - 21 = 19
    expect(getCurrentWeek(dueDate, today)).toBe(19)
  })

  it("returns a real week past 40 instead of clamping to 40", () => {
    const dueDate = new Date("2026-01-01")
    const today = new Date("2026-01-08")
    // 1 week past the due date => 40 + 1 = 41, well within 0..42
    expect(getCurrentWeek(dueDate, today)).toBe(41)
  })

  it("clamps to 42 when the due date passed long ago", () => {
    const today = new Date("2026-06-01")
    const dueDate = new Date("2026-01-01")
    expect(getCurrentWeek(dueDate, today)).toBe(42)
  })

  it("computes the unclamped week within range", () => {
    const dueDate = new Date("2026-09-21")
    const today = new Date("2026-07-27")
    // 8 weeks before the due date => 40 - 8 = 32
    expect(getCurrentWeek(dueDate, today)).toBe(32)
  })

  describe("boundary cases near the due date", () => {
    const dueDate = new Date("2026-09-21")

    it("is week 39 at 7 days before the due date", () => {
      expect(getCurrentWeek(dueDate, new Date("2026-09-14"))).toBe(39)
    })

    it("is week 39 at 6 days before the due date", () => {
      expect(getCurrentWeek(dueDate, new Date("2026-09-15"))).toBe(39)
    })

    it("is week 39 at 3 days before the due date", () => {
      expect(getCurrentWeek(dueDate, new Date("2026-09-18"))).toBe(39)
    })

    it("is week 39 at 1 day before the due date", () => {
      expect(getCurrentWeek(dueDate, new Date("2026-09-20"))).toBe(39)
    })

    it("is week 40 exactly on the due date", () => {
      expect(getCurrentWeek(dueDate, new Date("2026-09-21"))).toBe(40)
    })
  })
})
