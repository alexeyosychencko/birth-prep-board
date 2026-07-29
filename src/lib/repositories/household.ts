import type { Household } from "@/lib/types"

export interface HouseholdRepository {
  getOrCreateDefaultHousehold(): Promise<Household>
}
