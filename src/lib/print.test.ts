import { describe, expect, it } from "vitest"
import { formatPrintDate } from "./print"

describe("formatPrintDate", () => {
  it("formats a date with the Ukrainian genitive month name", () => {
    expect(formatPrintDate(new Date(2026, 6, 30))).toBe("30 липня 2026")
  })

  it("does not zero-pad the day", () => {
    expect(formatPrintDate(new Date(2026, 0, 5))).toBe("5 січня 2026")
  })

  it("formats December correctly", () => {
    expect(formatPrintDate(new Date(2026, 11, 1))).toBe("1 грудня 2026")
  })
})
