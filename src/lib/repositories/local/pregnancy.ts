import "server-only"
import { readStore, writeStore } from "./store"
import type { PregnancyRepository } from "@/lib/repositories/pregnancy"

export const pregnancyRepository: PregnancyRepository = {
  async getPregnancy(householdId) {
    return readStore(
      (store) => Object.values(store.pregnancies).find((p) => p.household_id === householdId) ?? null
    )
  },

  async updateDueDate(householdId, dueDate) {
    await writeStore((store) => {
      const pregnancy = Object.values(store.pregnancies).find((p) => p.household_id === householdId)
      if (!pregnancy) throw new Error(`Pregnancy not found for household ${householdId}`)
      pregnancy.due_date = dueDate
    })
  },
}
