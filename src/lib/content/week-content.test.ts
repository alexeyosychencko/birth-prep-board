import { describe, expect, it } from "vitest"
import { getWeekContent } from "./week-content"

describe("getWeekContent", () => {
  it("returns the matching entry for a valid week", () => {
    expect(getWeekContent(25)?.week).toBe(25)
  })

  it("returns null for a week outside the 20-40 table instead of silently substituting week 20", () => {
    expect(getWeekContent(19)).toBeNull()
    expect(getWeekContent(41)).toBeNull()
  })
})
