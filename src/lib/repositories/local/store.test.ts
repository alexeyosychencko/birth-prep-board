import { beforeEach, describe, expect, it, vi } from "vitest"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

beforeEach(() => {
  const dir = mkdtempSync(path.join(tmpdir(), "birth-prep-board-store-"))
  vi.spyOn(process, "cwd").mockReturnValue(dir)
  vi.resetModules()
})

describe("writeStore", () => {
  it("serializes concurrent mutations without lost updates", async () => {
    const { writeStore, readStore } = await import("./store")

    await Promise.all(
      Array.from({ length: 20 }, () =>
        writeStore((store) => {
          const goal = Object.values(store.budgetGoals)[0]!
          goal.goal_amount += 1
        })
      )
    )

    const finalGoal = await readStore((store) => Object.values(store.budgetGoals)[0]!)
    expect(finalGoal.goal_amount).toBe(20)
  })
})
