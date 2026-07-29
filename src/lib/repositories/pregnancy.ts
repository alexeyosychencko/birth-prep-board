import type { Pregnancy } from "@/lib/types"

export interface PregnancyRepository {
  getPregnancy(householdId: string): Promise<Pregnancy | null>
  updateDueDate(householdId: string, dueDate: string): Promise<void>
}
