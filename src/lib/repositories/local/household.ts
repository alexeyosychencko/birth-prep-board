import "server-only"
import { readStore } from "./store"
import type { HouseholdRepository } from "@/lib/repositories/household"

export const householdRepository: HouseholdRepository = {
  async getOrCreateDefaultHousehold() {
    return readStore((store) => {
      const [first] = Object.values(store.households)
      if (!first) {
        throw new Error("No household found — store bootstrap did not run")
      }
      return first
    })
  },
}
